export const ReadCircuitMessageType = "circuit";
export interface ReadCircuitMessage {
  name: string;
  text: string;
}

export const SaveReplayMessageType = "saveReplay";
export interface SaveReplayMessage {
  nick: string;
  date: number;
  circuitName: string;
  wordTiming: number[]; // offset from start, 1 entry per word
}
