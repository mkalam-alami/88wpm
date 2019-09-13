export const JoinMessageType = "join";
export interface JoinMessage {
  nickname: string;
}
export const JoinAckMessageType = "join-ack";
export interface JoinAckMessage {
  uuid: string;
}

export const LeaveMessageType = "leave";
export interface JoinMessage {
  uuid: string;
}

export const PlayerListMessageType = "players";
export interface PlayerListMessage {
  nicknames: string[];
}
