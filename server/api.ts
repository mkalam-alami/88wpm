import * as koaRouter from "koa-router";
import { saveCircuit, getAllCircuits } from "./circuit.service";
import { log } from "./core/log";

export const configureRoutes = (router: koaRouter) => {

    router.get('/api', async (context) => {
        await saveCircuit({
            name: 'test',
            text: 'a paragraph of text',
            replays: []
        });
        context.body = getAllCircuits();
    })

}
