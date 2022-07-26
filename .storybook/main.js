const _config = require('./_config')
const webpack = require('webpack')

module.exports = {
  reactOptions: {
    fastRefresh: true,
    strictMode: true,
  },
  env: (config) => ({
    ...config,
    APPKEY: _config.appKey,
    BASEURL: _config.baseUrl,
    ROOMKITAPPKEY: _config.roomkitAppKey,
    ROOMKITBASEURL: _config.roomkitBaseUrl,
    CHATROOMTOKEN: _config.chatroomToken,
    CHATROOMACCOUNT: _config.chatroomAccount,
    INIT_OPTIONS: _config.initOptions,
    LOGIN_OPTIONS: _config.loginOptions,
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
      plugins: options.plugins.filter(
        (x) =>
          !(typeof x === 'string' && x.includes('plugin-transform-classes'))
      ),
      // any extra options you want to set
    }
  },
  stories: _config.stories,
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
