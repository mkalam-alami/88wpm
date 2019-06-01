if (__filename.includes(".js")) {
  // Fix root-relative import paths from build
  // tslint:disable-next-line: no-var-requires
  require("module-alias/register");
}

import * as fs from "fs";
import { createServer } from "http";
import * as koa from "koa";
import * as koaMount from "koa-mount";
import * as koaRouter from "koa-router";
import * as koaStatic from "koa-static";
import * as mkdirp from "mkdirp";
import * as util from "util";
import * as webpack from "webpack";

import { configureRoutes } from "./api";
import config from "./core/config";
import { log } from "./core/log";
import { configureSocket } from "./socket";

(async () => {
  log.info("Starting server...");
  catchErrorsAndSignals();
  await buildFrontend();
  configureAndStartServer();
})();

function configureAndStartServer() {
  const app = new koa();
  const httpServer = createServer(app.callback());

  // Router
  const router = new koaRouter();
  app.use(requestLogger);
  configureRoutes(router);
  configureSocket(httpServer);
  app.use(koaStatic(config.absolutePathFromRoot("static")));
  app.use(koaMount("/dist/client", koaStatic(config.absolutePathFromRoot("dist/client"))));
  app.use(router.routes());

  // Start
  const port = config.PORT || 8000;
  httpServer.listen(port, () => {
    log.info(`Server started on port ${port}`);
  });
}

async function requestLogger(context: koa.ParameterizedContext, next: () => Promise<void>): Promise<void> {
  log.debug("Access: " + context.url);
  await next();
}

async function buildFrontend() {
  if (config.DEBUG_BUILD_FRONTEND_SOURCES === "true") {
    const env = config.NODE_ENV || "development";
    const webpackConfig = require(config.absolutePathFromRoot("client/webpack." + env + ".js"));

    await _createFolderIfMissing(webpackConfig.output.path);

    const compiler = webpack(webpackConfig);

    await new Promise((resolve) => {
      function callback(err, stats) {
        // https://webpack.js.org/api/node/#error-handling
        if (err) {
          // This means an error in webpack or its configuration, not an error in
          // the compiled sources.
          log.error(err.stack || err);
          if (err.details) {
            log.error(err.details);
          }
          return;
        }

        let logMethod = log.info.bind(log);
        if (stats.hasErrors()) {
          logMethod = log.error.bind(log);
        } else if (stats.hasWarnings()) {
          logMethod = log.warn.bind(log);
        }
        logMethod(stats.toString(webpackConfig.stats));

        resolve();
      }

      log.info("Setting up automatic client build...");
      compiler.watch(webpackConfig.watchOptions || {}, callback);
    });
  }
}

function catchErrorsAndSignals() {
  // Display unhandled errors more nicely
  process.on("uncaughtException", (error) => {
    log.error(`Uncaught exception: ${error.message}\n${error.stack}`);
    _doGracefulShutdown(null, 1);
  });
  process.on("unhandledRejection", (error) => {
    // tslint:disable-next-line: no-console
    log.error(`Unhandled promise rejection: ${error.message}\n${error.stack}`);
  });

  // Stop the server gracefully upon shut down signals
  let alreadyShuttingDown = false;
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGQUIT", "SIGTERM"];
  signals.forEach((signal) => {
    process.on(signal, _doGracefulShutdown);
  });
  function _doGracefulShutdown(_: NodeJS.Signals, exitCode: number = 0) {
    if (!alreadyShuttingDown) {
      alreadyShuttingDown = true;
      const db = require("./core/db").default;
      log.info("Shutting down.");
      db.knex.destroy(() => process.exit(exitCode));
    }
  }
}

/**
 * Creates a folder. No-op if the folder exists.
 */
async function _createFolderIfMissing(folderPath) {
  try {
    await util.promisify(fs.access)(folderPath, fs.constants.R_OK);
  } catch (e) {
    await util.promisify(mkdirp)(folderPath);
  }
}
