import './assets/global.css'

import { createApp } from 'vue'
import  VueGoogleMaps from '@fawmi/vue-google-maps'
import App from './App.vue';
import VueApexCharts from 'vue3-apexcharts';

const app = createApp(App);
app.use(VueApexCharts)
app.use(VueGoogleMaps, {
    load: {
        key: 'AIzaSyBxImdM2-R842_wYh2-Q7q2xgrn4Q6-bbM',
    },
})

app.mount('#app')