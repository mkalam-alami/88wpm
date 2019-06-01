import { circuitsCollection, NedbCallback, NedbFindCallback } from "./core/db";

export interface Circuit {
    name: string;
    text: string;
    replays: string[];
}

export async function findCircuit(options: Partial<Circuit>): Promise<Circuit> {
    return circuitsCollection.asyncFindOne(options);
}

export async function saveCircuit(circuit: Circuit): Promise<void> {
    const id = { name: circuit.name };
    circuitsCollection.asyncUpdate(id, circuit, { upsert: true });
}

export function getAllCircuits(): Circuit[] {
    return circuitsCollection.getAllData();
}
