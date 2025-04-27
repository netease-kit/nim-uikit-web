import { defineConfig } from "umi";

export default defineConfig({
  title: "Netease IM UIKit Demo",
  publicPath: "./",
  layout: false,
  base: "./",
  hash: true,
  history: {
    type: "hash",
  },
  nodeModulesTransform: {
    type: "none",
  },
  webpack5: {},
  routes: [
    {
      path: "/",
      component: "@/pages/",
    },
  ],
});
