const _config = require("./_config");
const webpack = require("webpack");

const env = process.env.STORYBOOK_ENV || "dev"; // prod || dev

module.exports = {
  reactOptions: {
    fastRefresh: true,
    strictMode: true,
  },
  core: {
    builder: {
      name: "webpack5",
      options: {
        fsCache: true,
      },
    },
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
          !(typeof x === "string" && x.includes("plugin-transform-classes"))
      ),
      // any extra options you want to set
    };
  },
  stories: _config.stories,
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
  webpackFinal: async (config, { configType }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.PLATFORM": JSON.stringify("web"),
      })
    );

    if (env === "dev") {
      config.resolve.extensions = [...config.resolve.extensions, ".d.ts"];
      config.module.rules.push({
        test: /\.d.ts$/,
        use: config.module.rules[0].use,
        include: [
          config.module.rules[0].include[0] +
            "/node_modules/nim-web-sdk-ng/dist",
        ],
      });
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    config.resolve.extensions = [...config.resolve.extensions, ".d.ts"];
    config.module.rules.push({
      test: /\.less$/,
      use: [
        "style-loader",
        "css-loader",
        {
          loader: "less-loader",
          options: {
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    });
    config.module.parser = {
      ...config.module.parser,
      javascript: {
        reexportExportsPresence: "error",
      },
    };
    return config;
  },
};
