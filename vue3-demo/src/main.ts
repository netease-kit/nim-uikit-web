import "./assets/main.css";
import router from "./router";
import { createApp } from "vue";
import App from "./App.vue";
import "./global.css";
import VueVirtualScroller from 'vue-virtual-scroller'

const app = createApp(App);
app.use(router);
app.use(VueVirtualScroller)
app.mount("#app");

export default app;
