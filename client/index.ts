import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";

Vue.use(VueAxios, axios);

new Vue({
    el: '#app',
    data: {
        who: 'client',
        message: ''
    },
    mounted: async function() {
        const response = await Vue.axios.get('/api')
        this.message = response.data;
    }
})
