// tslint:disable:no-unused-expression

import axios from "axios";
import * as io from "socket.io-client";
import Vue from "vue";
import VueAxios from "vue-axios";
import vueNumeralFilter from "vue-numeral-filter";
import { GetRandomCircuit, GetRandomCircuitURI } from "../common/api-def";

Vue.use(VueAxios, axios);
Vue.use(vueNumeralFilter);

const socket = io.connect("/");

new Vue({
    el: "#app",
    data: {
        nick: "",
        circuit: {
            name: "",
            text: [] as string[]
        },
        wordTiming: [] as number[],
        currentWord: -1,
        currentWordError: false,
        otherCars: [] as Array<{nick: string, wordTiming: number[]}>,
        startTime: 0
    },
    computed: {
        lanes() {
            const elapsedTime = Date.now() - this.startTime;
            const allLanes: Array<{nick: string, progress: number}> = [
                { nick: this.nick, progress: progressPercentFromWordIndex(this.currentWord, this.circuit.text.length)},
                ...this.otherCars.map((car) => {
                    return {
                        nick: car.nick,
                        progress: progressPercentFromWordTiming(elapsedTime, car.wordTiming)
                    };
                })
            ];
            return allLanes.sort((lane) => lane.progress);
        },
        words() {
            return this.circuit.text
                .map((str: string, index: number) => {
                    return { 
                        word: str,
                        state: wordIndexToState(index, this.currentWord, this.currentWordError)
                    };
                });
        }
    },
    async mounted() {
        const response = await this.axios.get<GetRandomCircuit>(GetRandomCircuitURI);
        this.circuit = response.data.circuit;
    }
});

function wordIndexToState(wordIndex: number, currentWordIndex: number, currentWordError: boolean) {
    if (wordIndex > currentWordIndex) {
        return "pending";
    } else if (wordIndex < currentWordIndex) {
        return "done";
    } else if (currentWordError) {
        return "error";
    } else {
        return "todo";
    }
}

function progressPercentFromWordIndex(wordIndex: number, wordCount: number): number {
    return Math.max(0, wordIndex) * 1. / wordCount;
}

function progressPercentFromWordTiming(currentTime: number, wordTiming: number[]): number {
    const wordIndex = wordTiming.findIndex((timing) => timing > currentTime) - 1;
    if (wordIndex === -2) {
        return 1.;
    } else {
        return progressPercentFromWordIndex(wordIndex, wordTiming.length);
    }
}
