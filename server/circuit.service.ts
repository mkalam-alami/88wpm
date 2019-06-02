import { shuffle } from "lodash";
import { circuitsCollection } from "./core/db";

export interface Circuit {
    name: string;
    text: string;
}

export async function findCircuit(options: Partial<Circuit>): Promise<Circuit> {
    return circuitsCollection.asyncFindOne(options);
}

export async function saveCircuit(circuit: Circuit): Promise<void> {
    const id = { name: circuit.name };
    circuitsCollection.asyncUpdate(id, circuit, { upsert: true });
}

export function getRandomCircuit(): Circuit {
    const allCircuits = circuitsCollection.getAllData();
    if (allCircuits.length > 0) {
        return shuffle(allCircuits)[0];
    } else {
        throw new Error("no circuit found");
    }
}

export function getAllCircuits(): Circuit[] {
    return circuitsCollection.getAllData();
}
