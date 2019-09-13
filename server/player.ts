import { Socket } from "socket.io";
import * as uuid from "uuid";

export class Player {

  public readonly uuid = uuid();

  constructor(
    public readonly nickname: string,
    public readonly socket: Socket) { }

}
