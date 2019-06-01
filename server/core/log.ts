import * as eazyLogger from "eazy-logger";
import config from "./config";

export const log = eazyLogger.Logger({
    prefix: "{blue:[}{magenta:88wpm}{blue:] }",
    useLevelPrefixes: true,
    level: config.LOG_LEVEL
});
