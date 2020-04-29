import Vue from "vue";
import App from "./App.vue";
import VueSocketIO from "vue-socket.io"
import router from "./router";
import './../node_modules/bulma/css/bulma.css';

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

Vue.use(new VueSocketIO({
    debug: true,
    connection: "192.168.0.101:9090",
}));

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
