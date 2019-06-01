import { existsSync, mkdirSync } from "fs";
import nedbAsync from "nedb-async";
import * as path from "path";
import Config from "./config";
import { log } from "./log";

createDataRoot();

export const replaysCollection = openCollection("replays");
export const circuitsCollection = openCollection("circuits");

export type NedbCallback = (err: Error) => void;
export type NedbFindCallback<T> = (err: Error, document: T) => void;

function createDataRoot() {
    try {
        mkdirSync(getDataRoot(), { recursive: true });
    } catch (e) {
        if (!existsSync(getDataRoot())) {
            log.error(e);
        }
    }
}

function getDataRoot() {
    return path.isAbsolute(Config.DATA_PATH)
    ? Config.DATA_PATH
    : Config.absolutePathFromRoot(Config.DATA_PATH);
}

function openCollection(name: string) {
    return new nedbAsync({
        filename: path.resolve(getDataRoot(), name + ".db"),
        autoload: true
    });
}
