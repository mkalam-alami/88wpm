// tslint:disable:no-unused-expression

import axios from "axios";
import * as io from "socket.io-client";
import Vue from "vue";
import VueAxios from "vue-axios";
import { CircuitMessage, CircuitMessageType } from "../common/messages";

Vue.use(VueAxios, axios);

const app = new Vue({
    el: "#app",
    data: {
        who: "client",
        message: ""
    },
    async mounted() {
        const response = await Vue.axios.get("/api");
        this.message = response.data;
    }
});

const socket = io.connect("/");
socket.on(CircuitMessageType, (data: CircuitMessage) => {
    app.message = data.name + " / " + data.text;
});
