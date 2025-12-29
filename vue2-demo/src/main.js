import Vue from "vue";
import App from "./App.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import router from "./router";
import "./global.css";

Vue.config.productionTip = false;
Vue.component("RecycleScroller", RecycleScroller);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
