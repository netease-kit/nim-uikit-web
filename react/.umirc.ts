import { defineConfig } from "umi";

export default defineConfig({
  npmClient: "npm",
  mfsu: false,
  chainWebpack(config) {
    config.resolve.extensions.add(".d.ts");
  },
});
