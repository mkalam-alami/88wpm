// tslint:disable:no-console

import * as dotenv from "dotenv";
import * as findUp from "find-up";
import * as path from "path";

class Config {

    constructor() {
        const envFile = process.env.NODE_ENV;
        const configOutput = dotenv.config({
            path: envFile + ".env"
        });

        if (configOutput.error) {
            console.error(configOutput.error);
            process.exit(1);
        }

        process.env.ROOT_PATH = path.dirname(findUp.sync("package.json", { cwd: __dirname }));
    }

    public get ROOT_PATH() {
        return process.env.ROOT_PATH;
    }

    public get PORT() {
        return process.env.PORT || 8000;
    }

    public get DEBUG_BUILD_FRONTEND_SOURCES() {
        return process.env.DEBUG_BUILD_FRONTEND_SOURCES;
    }

    public get NODE_ENV() {
        return process.env.NODE_ENV || "development";
    }

    public get DATA_PATH() {
        return process.env.DATA_PATH || "data/";
    }

    public get LOG_LEVEL() {
        return process.env.LOG_LEVEL || "info";
    }

    public absolutePathFromRoot(relativePath: string): string {
        return path.resolve(process.env.ROOT_PATH, relativePath);
    }

}

export default new Config();
