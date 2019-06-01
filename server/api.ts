import * as koaRouter from "koa-router";

export const configureRoutes = (router: koaRouter) => {

    router.get('/api', (context) => {
        context.body = "Hello server";
    })

}