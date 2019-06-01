export const GetRandomCircuitURI = "/api/random-circuit";
export interface GetRandomCircuit {
  circuit: {
    name: string;
    text: string;
  };
  replays: Array<{
    nick: string;
    wordTiming: number[]; // offset from start, 1 entry per word
  }>;
}
