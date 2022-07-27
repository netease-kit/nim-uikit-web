const webpack = require('webpack')
const env = process.env.STORYBOOK_ENV || 'dev' // prod || dev

const baseUrl = {
  dev: 'https://yiyong-qa.netease.im',
  prod: 'https://yiyong.netease.im',
}[env]
const appKey = {
  dev: '56813bdfbaa1c2a29bbea391ffbbe27a',
  prod: '9ee2101a195b4044c4002d1972156396',
}[env]

const stories = {
  dev: [
    '../docs/**/*.stories.mdx',
    '../docs/**/*.stories.@(js|jsx|ts|tsx)',
    '../packages/**/*.stories.mdx',
    '../packages/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  prod: [
    '../docs/**/*.stories.mdx',
    '../docs/**/*.stories.@(js|jsx|ts|tsx)',
    '../packages/**/*.stories.prod.mdx',
    '../packages/**/*.stories.prod.@(js|jsx|ts|tsx)',
  ],
}[env]

module.exports = {
  reactOptions: {
    fastRefresh: true,
    strictMode: true,
  },
  env: (config) => ({
    ...config,
    APPKEY: appKey,
    BASEURL: baseUrl,
  }),
  babel: async (options) => {
    /*
    options.plugins.push([
      'import',
      {
        libraryName: '@xkit-yx/login-ui-kit',
        libraryDirectory: 'lib/components',
        style: true, // or 'css'
      },
    ])
    */
    return {
      ...options,
      // any extra options you want to set
    }
  },
  stories,
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
  webpackFinal: async (config, { configType }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.PLATFORM': JSON.stringify('web'),
      })
    )
    config.module.rules.push({
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              // 如果使用less-loader@5，请移除 \
              // modifyVars: {
              //   'ant-prefix': 'ant',
              // },
              javascriptEnabled: true,
            },
          },
        },
      ],
    })
    return config
  },
}
