import { CircuitMessage, CircuitMessageType } from "common/messages";
import { Server } from "http";
import * as socketio from "socket.io";
import { getAllCircuits } from "./circuit.service";

export const configureSocket = (app: Server) => {

    const io = socketio(app);

    io.on("connection", (socket) => {
        const circuits = getAllCircuits();
        if (circuits.length > 0) {
            const { name, text } = circuits[0];
            const message: CircuitMessage = { name, text };
            socket.emit(CircuitMessageType, message);
        }
    });

}