import { SaveReplayMessage, SaveReplayMessageType } from "../common/socket-def";

export function saveReplay(socket: SocketIOClient.Socket, replay: SaveReplayMessage) {
  socket.emit(SaveReplayMessageType, replay);
}

