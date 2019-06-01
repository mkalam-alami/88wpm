import { replaysCollection } from "./core/db";

export interface Replay {
    _id?: string;
    nick: string;
    sprite: string;
    timeMs: number;
    wordTiming: number[]; // offset from start, 1 entry per word
    date: number;
    circuitName: string;
    bestTime?: boolean; // best time for this nick
}

export async function findReplay(options: Partial<Replay>): Promise<Replay> {
    return replaysCollection.asyncFindOne(options);
}

export async function findReplays(options: Partial<Replay>|any): Promise<Replay[]> {
    return replaysCollection.asyncFind(options);
}

export async function saveReplay(replay: Replay): Promise<void> {
    const { nick, circuitName } = replay;
    const existingReplay = await findReplay({ nick, circuitName, bestTime: true });
    if (existingReplay) {
        if (existingReplay.timeMs < replay.timeMs) {
            replay.bestTime = false;
        } else {
            replay.bestTime = true;
            existingReplay.bestTime = false;
            await replaysCollection.asyncUpdate({ _id: existingReplay._id! }, existingReplay);
        }
    } else {
        replay.bestTime = true;
    }
    await replaysCollection.asyncInsert(replay);
}

export function getAllReplays(): Replay[] {
    return replaysCollection.getAllData();
}
