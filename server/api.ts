import * as koaRouter from "koa-router";
import { getAllCircuits, saveCircuit } from "./circuit.service";

export const configureRoutes = (router: koaRouter) => {

    router.get("/api", async (context) => {
        await saveCircuit({
            name: "test",
            text: "a paragraph of text",
            replays: []
        });
        context.body = getAllCircuits();
    });

};
