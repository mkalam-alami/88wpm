import { GetRandomCircuit, GetRandomCircuitURI, SaveReplay, SaveReplayURI } from "common/api-def";
import * as koaRouter from "koa-router";
import { getRandomCircuit } from "./circuit.service";
import { chooseReplaysForGame, Replay, saveReplay } from "./replay.service";

export const configureRoutes = (router: koaRouter) => {

    router.get(GetRandomCircuitURI, async (context) => {
        const circuit = getRandomCircuit();
        const replays = await chooseReplaysForGame(circuit.name, context.query.nick);

        let botNumber = 1;
        const body: GetRandomCircuit = {
            circuit: {
                name: circuit.name,
                text: circuit.text.split(/ /g)
            },
            replays: replays.map((replay) => {
                const { nick, wordTiming } = replay;
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
            };
            await saveReplay(newReplay);
            context.status = 200;
        }
    });

};
