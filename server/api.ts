import { GetRandomCircuit, GetRandomCircuitURI, SaveReplay, SaveReplayURI } from "common/api-def";
import * as koaRouter from "koa-router";
import { getAllCircuits } from "./circuit.service";
import { findReplays, Replay, saveReplay } from "./replay.service";

export const configureRoutes = (router: koaRouter) => {

    router.get(GetRandomCircuitURI, async (context) => {
        const circuits = getAllCircuits(); // XXX
        if (circuits.length === 0) {
            context.status = 204;
            return;
        }

        const circuit = circuits[0]; // XXX

        const replaySearchOptions: any = { circuitName: circuit.name };
        if (context.query.nick) {
            replaySearchOptions.nick = { $ne: context.query.nick };
        }
        const replays = await findReplays(replaySearchOptions);

        let botNumber = 1;
        const body: GetRandomCircuit = {
            circuit: {
                name: circuit.name,
                text: circuit.text.split(/ /g)
            },
            replays: replays.map((replay) => {
                const { nick, sprite, wordTiming } = replay;
                return {
                    nick: (replay.bestTime && nick) ? nick : ("BOT #" + botNumber++),
                    sprite: "car2",
                    wordTiming
                };
            })
        };
        context.body = body;
    });

    router.post(SaveReplayURI, async (context) => {
        const replayData = (context.request as any).body as SaveReplay;
        if (replayData && replayData.wordTiming.length > 0) { // XXX Validate word count
            const newReplay: Replay = {
                ...replayData,
                timeMs: replayData.wordTiming[replayData.wordTiming.length - 1]
            }
            await saveReplay(newReplay);
            context.status = 200;
        }
    });

};
