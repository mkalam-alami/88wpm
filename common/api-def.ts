export const GetRandomCircuitURI = "/api/random-circuit";
export interface GetRandomCircuit {
  circuit: {
    name: string;
    text: string[];
  };
  replays: Array<{
    nick: string;
    sprite: string;
    wordTiming: number[]; // offset from start, 1 entry per word
  }>;
}

export const SaveReplayURI = "/api/save-replay";
export interface SaveReplay {
  nick: string;
  sprite: string;
  date: number;
  circuitName: string;
  wordTiming: number[]; // offset from start, 1 entry per word
}
