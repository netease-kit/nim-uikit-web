import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  chainWebpack(memo) {
    memo.resolve.extensions.add('.d.ts');
  },
});