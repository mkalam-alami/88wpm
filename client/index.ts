// tslint:disable:no-unused-expression

import axios from "axios";
import * as io from "socket.io-client";
import Vue from "vue";
import VueAxios from "vue-axios";
import { GetRandomCircuit, GetRandomCircuitURI } from "../common/api-def";

Vue.use(VueAxios, axios);

const socket = io.connect("/");

const app = new Vue({
    el: "#app",
    data: {
        who: "client",
        message: "",
    },
    async mounted() {
        const response = await this.axios.get<GetRandomCircuit>(GetRandomCircuitURI);
        this.message = response.data.circuit.text;
    }
});
