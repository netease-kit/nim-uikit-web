import * as path from 'path'
import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import postcss from 'rollup-plugin-postcss'
import nested from 'postcss-nested'

const isDev = process.env.DEV

const EXTERNALS = {
  react: 'React',
  'react-dom': 'ReactDOM',
  antd: 'antd',
  '@ant-design/icons': '@ant-design/icons',
  'react/jsx-runtime': 'jsxRuntime',
}

export default {
  input: './src/index.ts',
  output: [
    {
      file: './dist/index.umd.js',
      name: 'NEConversationKit',
      format: 'umd',
      exports: 'named',
      plugins: [!isDev && terser()],
      globals: EXTERNALS,
    },
    {
      file: './dist/index.esm.js',
      format: 'esm',
      exports: 'named',
      plugins: [!isDev && terser()],
      globals: EXTERNALS,
    },
    {
      file: './dist/index.cjs.js',
      format: 'cjs',
      exports: 'named',
      plugins: [!isDev && terser()],
      globals: EXTERNALS,
    },
  ],
  external: Object.keys(EXTERNALS),
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
    }),

    nodeResolve({
      mainFields: ['jsnext', 'preferBuiltins', 'browser'],
    }),

    commonjs({
      include: ['./node_modules/**'],
    }),

    json(),

    postcss({
      extensions: ['.less'],
      extract: false,
      modules: false,
      plugins: [nested()],
    }),
  ],
}
