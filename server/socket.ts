import { Server } from "http";
import * as socketio from "socket.io";
import { log } from "./core/log";

export const configureSocket = (app: Server) => {

    const io = socketio(app);

    io.on("connection", (socket) => {
        socket.emit("test");
        socket.emit("test");
        socket.emit("test");
    });

}