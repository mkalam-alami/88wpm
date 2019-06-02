// tslint:disable:no-unused-expression

import axios from "axios";
import * as io from "socket.io-client";
import Vue from "vue";
import VueAxios from "vue-axios";
import vueNumeralFilter from "vue-numeral-filter";
import { GetRandomCircuit, GetRandomCircuitURI, SaveReplay, SaveReplayURI } from "../common/api-def";
import * as ui from "./ui";

Vue.use(VueAxios, axios);
Vue.use(vueNumeralFilter);

const socket = io.connect("/");

type ActiveScreen = "menu" | "countdown" | "play" | "gameOver";

interface CarLane {
    nick: string;
    sprite: string;
    wordTiming: number[];
    progressPercent: number;
}

const defaultData = {
    nick: "",
    sprite: "car1",
    circuit: {
        name: "",
        text: [] as string[]
    },
    textInput: "",
    currentWordError: false,
    lanes: [] as CarLane[],
    startTime: 0,
    currentTime: 0,
    activeScreen: "menu" as ActiveScreen,
    wpm: 0,
    lightsOn: 0
};

let refreshInterval: number|null = null;

new Vue({
    el: "#app",
    data: defaultData,

    watch: {
        textInput(value: string) {
            if (this.activeScreen !== "play") {
                return;
            }

            const expectedWord = this.circuit.text[this.currentWordIndex]
                .concat((this.currentWordIndex < this.circuit.text.length - 1) ? " " : "");
            if (!expectedWord.startsWith(value)) {
                this.currentWordError = true;
            } else {
                const elapsedTime = Date.now() - this.startTime;
                this.currentWordError = false;
                if (expectedWord === value) {
                    this.ownLane.wordTiming.push(elapsedTime);
                    if (this.ownLane.wordTiming.length >= this.circuit.text.length) {
                        this.activeScreen = "gameOver";
                    } else {
                        this.textInput = "";
                    }

                    const lettersTyped = this.circuit.text.slice(0, this.ownLane.wordTiming.length).join("").length;
                    const wordsTyped = lettersTyped / 4.5; // English average
                    this.wpm = Math.floor(wordsTyped * 60000. / elapsedTime);
                }
            }
        },
        async activeScreen(value: ActiveScreen) {
            if (value === "gameOver") {
                const replay: SaveReplay = {
                    nick: this.nick,
                    circuitName: this.circuit.name,
                    date: Date.now(),
                    sprite: this.sprite,
                    wordTiming: this.ownLane.wordTiming
                };
                await this.axios.post<SaveReplay>(SaveReplayURI, replay);
            }
        }
    },

    computed: {
        words() {
            const ownLane = getOwnLane(this.lanes, this.nick);
            return this.circuit.text
                .map((str: string, index: number) => {
                    return {
                        word: str,
                        state: ui.wordIndexToState(index, ownLane.wordTiming.length, this.currentWordError)
                    };
                });
        },
        ranking() {
            const ownLane = getOwnLane(this.lanes, this.nick);
            return this.lanes.filter((otherLane) => {
                return otherLane.nick !== this.nick
                    && (otherLane.progressPercent > ownLane.progressPercent
                    || hasFinishedSameWordBefore(otherLane, ownLane));
            }).length + 1;
        },
        ownLane() {
            return getOwnLane(this.lanes, this.nick);
        },
        currentWordIndex() {
            return getOwnLane(this.lanes, this.nick).wordTiming.length;
        }
    },

    methods: {
        async newGame() {
            this.reset();
            this.activeScreen = "countdown";
            this.nick = this.nick || "unknown";
            const response = await this.axios.get<GetRandomCircuit>(GetRandomCircuitURI + `?nick=${this.nick}`);
            this.circuit = response.data.circuit;
            this.lanes = [
                { nick: this.nick, sprite: this.sprite, wordTiming: [], progressPercent: 0.0 },
                ...response.data.replays.map((replay) => ({ ...replay, progressPercent: 0.0 }))
            ];
            this.startTime = Date.now() + 4000;
            focusTextInput();

            clearInterval(refreshInterval!);
            refreshInterval = setInterval(() => {
                this.currentTime = Date.now();
                const elapsedTime = this.currentTime - this.startTime;

                // Force progress refresh of other cars
                this.lanes.forEach((lane) => {
                    lane.progressPercent = ui.progressPercentFromWordTiming(
                        elapsedTime, lane.wordTiming, this.circuit.text.length);
                });

                // Force refresh of countdown
                if (this.activeScreen === "countdown") {
                    this.lightsOn = elapsedTime / 1000. + 4.;
                    if (this.lightsOn >= 4) {
                        this.activeScreen = "play";
                        focusTextInput();
                    }
                }
            }, 500);
        },
        reset() {
            this.circuit = { name: "", text: [] };
            this.lanes = [{ nick: this.nick, sprite: this.sprite, wordTiming: [], progressPercent: 0.0 }];
            this.activeScreen = "menu";
            this.wpm = 0.;
            this.lightsOn = 0;
        },
        onTextInput(event: KeyboardEvent) {
            if (event.keyCode === 27/*ESCAPE*/) {
                this.reset();
            }
        }
    }
});

function getOwnLane(allCars: CarLane[], nick: string) {
    return allCars.find((car) => car.nick === nick)!;
}

function hasFinishedSameWordBefore(otherLane: CarLane, ownLane: CarLane) {
    return otherLane.progressPercent > 0
        && otherLane.progressPercent === ownLane.progressPercent
        && otherLane.wordTiming[otherLane.wordTiming.length - 1] < ownLane.wordTiming[ownLane.wordTiming.length - 1];
}

function focusTextInput() {
    (document.getElementById("text-input") as HTMLInputElement).focus();
}
