import * as socketDef from "common/socket-def";
import { Player } from "server/player";
import { Server, Socket } from "socket.io";
import { log } from "./core/log";

export default (io: Server) => {
  return new GameManager(io);
};

class GameManager {

  private players: Record<string, Player> = {};

  private intervalHandle: NodeJS.Timeout;

  constructor(private io: Server) {
    this.intervalHandle = setInterval(this.update.bind(this), 1000);
    this.io.on("connection", this.onConnection.bind(this));
  }

  public addPlayer(nickname: string, socket: Socket): string {
    const newPlayer = new Player(nickname, socket);
    this.players[newPlayer.uuid] = newPlayer;

    const ackMessage: socketDef.JoinAckMessage = { uuid: newPlayer.uuid };
    socket.emit(socketDef.JoinAckMessageType, ackMessage);

    this.broadcastPlayerList();
    return newPlayer.uuid;
  }

  public removePlayer(uuid: string): void {
    delete this.players[uuid];
    this.broadcastPlayerList();
  }

  public broadcastPlayerList(): void {
    const data: socketDef.PlayerListMessage = { nicknames: this.playerNicknames };
    this.io.emit(socketDef.PlayerListMessageType, data);
  }

  public finalize() {
    clearInterval(this.intervalHandle);
  }

  get playerNicknames() {
    return Object.values(this.players).map((p) => p.nickname);
  }

  private onConnection(socket: Socket): void {
    let uuid;

    socket.on(socketDef.JoinMessageType, (data: socketDef.JoinMessage) => {
      uuid = this.addPlayer(data.nickname, socket);
    });

    socket.on("disconnect", () => {
      if (uuid) {
        this.removePlayer(uuid);
      }
    });
  }

  private update(): void {
    log.info("tick", this.playerNicknames);
  }

}
