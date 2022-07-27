import pkg from './package.json'
import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import json from '@rollup/plugin-json'

const isDev = process.env.DEV

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]

const treeshake = {
  moduleSideEffects: false,
}

const plugins = [
  typescript({
    tsconfig: './tsconfig.json',
    useTsconfigDeclarationDir: true,
  }),
  nodeResolve({
    mainFields: ['jsnext', 'preferBuiltins', 'browser'],
  }),
  commonjs(),
  json(),
].filter(Boolean)

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.miniprogram + '/index.js',
        format: 'cjs',
        exports: 'named',
      },
    ],
    plugins: [
      ...plugins,
      replace({
        'process.env.PLATFORM': JSON.stringify('wx'),
      }),
    ],
    treeshake,
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.unpkg,
        name: pkg.name,
        format: 'umd',
        exports: 'named',
      },
    ],
    plugins: [
      ...plugins,
      !isDev && terser(),
      replace({
        'process.env.PLATFORM': JSON.stringify('web'),
      }),
    ],
    treeshake,
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'esm',
        exports: 'named',
      },
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
      },
    ],
    plugins: [
      ...plugins,
      replace({
        'process.env.PLATFORM': JSON.stringify('web'),
      }),
    ],
    treeshake,
    external,
  },
]
