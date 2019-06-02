import { shuffle } from "lodash";
import { replaysCollection } from "./core/db";
import { sanitizeNick } from "common/form";

const MAX_REPLAYS = 29;

export interface Replay {
    _id?: string;
    nick: string;
    username?: string;
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

export async function chooseReplaysForGame(circuitName: string, nick: string): Promise<Replay[]> {
    const username = generateUsername(sanitizeNick(nick));
    const interestingReplays = await getReplays({
        circuitName,
        username: { $ne: username },
        bestTime: true
    });

    let replays;
    if (interestingReplays.length > MAX_REPLAYS) {
        replays = shuffle(interestingReplays).slice(0, MAX_REPLAYS);
    } else {
        const fillerReplays = await getReplays({
            circuitName,
            nick: { $ne: nick },
            bestTime: false
        }, MAX_REPLAYS - interestingReplays.length);
        replays = interestingReplays.concat(fillerReplays);
    }

    return shuffle(replays);
}

export async function getReplays(options: Partial<Replay>|any, maxSize?: number): Promise<Replay[]> {
    return new Promise((resolve, reject) => {
        let cursor: Nedb.Cursor<Replay> = replaysCollection.find(options);
        if (maxSize) {
            cursor = cursor.limit(maxSize);
        }
        cursor.exec((err, documents) => {
            if (err) {
                reject(err);
            } else {
                resolve(documents);
            }
        });
    });
}

export async function saveReplay(replay: Replay): Promise<void> {
    replay.nick = sanitizeNick(replay.nick);
    replay.username = generateUsername(replay.nick);

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

function generateUsername(nick: string) {
    return nick.toLowerCase().trim();
}
