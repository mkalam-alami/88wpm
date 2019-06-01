import * as koaRouter from "koa-router";
import { getAllCircuits, saveCircuit } from "./circuit.service";
import { GetRandomCircuitURI, GetRandomCircuit } from "common/api-def";
import { findReplays } from "./replay.service";

export const configureRoutes = (router: koaRouter) => {

    router.get(GetRandomCircuitURI, async (context) => {
        const circuits = getAllCircuits(); // XXX
        if (circuits.length === 0) {
            context.status = 204;
            return;
        }

        const { name, text } = { ...circuits[0] }; // XXX
        const replays = await findReplays({ circuitName: name });

        let botNumber = 1;
        const body: GetRandomCircuit = {
            circuit: { name, text },
            replays: replays.map((replay) => {
                const { nick, wordTiming } = replay;
                return {
                    nick: replay.bestTime ? nick : ("BOT #" + botNumber++),
                    wordTiming
                };
            })
        };
        context.body = body;
    });

};
