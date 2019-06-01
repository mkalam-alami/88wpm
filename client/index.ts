// tslint:disable:no-unused-expression

import axios from "axios";
import Vue from "vue";
import VueAxios from "vue-axios";

Vue.use(VueAxios, axios);

new Vue({
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
