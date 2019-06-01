import { ReadCircuitMessage, ReadCircuitMessageType,
    SaveReplayMessage, SaveReplayMessageType } from "common/socket-def";
import { Server } from "http";
import * as socketio from "socket.io";
import { getAllCircuits } from "./circuit.service";
import { Replay, saveReplay } from "./replay.service";

export const configureSocket = (app: Server) => {

    const io = socketio(app);

    io.on("connection", (socket) => {
        const circuits = getAllCircuits();
        if (circuits.length > 0) {
            const { name, text } = circuits[0];
            const message: ReadCircuitMessage = { name, text };
            socket.emit(ReadCircuitMessageType, message);
        }

        socket.on(SaveReplayMessageType, (data: SaveReplayMessage) => {
            const { nick, circuitName, date, wordTiming } = data;
            const replay: Replay = {
                nick,
                circuitName,
                date,
                timeMs: wordTiming[wordTiming.length - 1],
                wordTiming
            }
            saveReplay(replay);
        });
    });


}