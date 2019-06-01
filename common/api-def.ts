export const GetRandomCircuitURI = "/api/random-circuit";
export interface GetRandomCircuit {
  circuit: {
    name: string;
    text: string[];
  };
  replays: Array<{
    nick: string;
    sprite: number;
    wordTiming: number[]; // offset from start, 1 entry per word
  }>;
}
