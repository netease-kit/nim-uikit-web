import "./assets/main.css";
import router from "./router";
import { createApp } from "vue";
import App from "./App.vue";
import "./global.css";
import VueVirtualScroller from "vue-virtual-scroller";
// QChat需要的依赖
import { Select } from "ant-design-vue";
import "ant-design-vue/dist/antd.css"; // 添加ant-design-vue样式
import "markstream-vue/index.css"; // 添加markstream-vue样式
import { createI18n } from "vue-i18n";
// @ts-ignore
import infiniteScroll from "vue3-infinite-scroll-good";

// 为QChat创建全局的i18n实例
const i18n = createI18n({
  locale: "zh",
  fallbackLocale: "zh",
  messages: {
    zh: {},
    en: {},
  },
  legacy: false,
  globalInjection: true,
});

const app = createApp(App);
app.use(router);
app.use(VueVirtualScroller);
app.use(i18n); // 安装全局i18n
// QChat需要的插件
app.use(infiniteScroll);
app.use(Select);
app.mount("#app");

export default app;
