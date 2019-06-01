if (__filename.includes(".js")) {
  // Fix root-relative import paths from build
  // tslint:disable-next-line: no-var-requires
  require("module-alias/register");
}

import * as koa from "koa";
import * as koaRouter from "koa-router";
import * as koaStatic from "koa-static";
import * as koaMount from "koa-mount";
import * as webpack from "webpack";
import * as dotenv from "dotenv";
import * as path from "path";
import * as findUp from "find-up";
import * as mkdirp from "mkdirp";
import * as fs from "fs";
import * as util from "util";

import { log } from "./log";
import { configureRoutes } from "./api";

const ROOT_PATH = path.dirname(findUp.sync("package.json", { cwd: __dirname }));

(async () => {
  log.info("Starting server...");
  catchErrorsAndSignals();
  configureEnvironment();
  await buildFrontend();
  configureAndStartServer();
})();


function configureEnvironment() {
  const envFile = process.env.NODE_ENV;
  const configOutput = dotenv.config({
    path: envFile + '.env'
  });

  if (configOutput.error) {
    log.error(configOutput.error);
    process.exit(1);
  }
}

function configureAndStartServer() {
  const app = new koa();

  // Router
  const router = new koaRouter();
  configureRoutes(router);
  app.use(koaStatic(path.resolve(ROOT_PATH, 'static')));
  app.use(koaMount('/dist/client', koaStatic(path.resolve(ROOT_PATH, 'dist/client'))));
  app.use(router.routes());

  // Start
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    log.info(`Server started on port ${port}`);
  });
}

async function buildFrontend() {
  if (process.env.DEBUG_BUILD_FRONTEND_SOURCES === 'true') {
    const env = process.env.NODE_ENV || "development";
    const webpackConfig = require(path.join(ROOT_PATH, "./webpack." + env + ".js"));

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
