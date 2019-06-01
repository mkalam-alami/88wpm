import nedbAsync from "nedb-async";
import * as path from "path";
import Config from "./config";
import { mkdirSync } from "fs";

mkdirSync(getDataRoot(), { recursive: true });

export const replaysCollection = openCollection('replays')
export const circuitsCollection = openCollection('circuits')

export type NedbCallback = (err: Error) => void;
export type NedbFindCallback<T> = (err: Error, document: T) => void;

function getDataRoot() {
    return path.isAbsolute(Config.DATA_PATH)
    ? Config.DATA_PATH
    : Config.absolutePathFromRoot(Config.DATA_PATH);
}

function openCollection(name: string) {
    return new nedbAsync({
        filename: path.resolve(getDataRoot(), name + '.db'),
        autoload: true
    });
}
