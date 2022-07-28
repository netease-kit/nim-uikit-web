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
    INIT_OPTIONS: _config.initOptions,
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
