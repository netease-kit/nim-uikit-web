const env = process.env.STORYBOOK_ENV || "dev"; // prod || dev

module.exports = {
  baseUrl: {
    dev: "",
    prod: "",
  }[env],

  appKey: {
    dev: "",
    prod: "",
  }[env],

  roomkitBaseUrl: {
    dev: "",
    prod: "",
  }[env],

  roomkitAppKey: {
    dev: "",
    prod: "",
  }[env],

  chatroomToken: {
    dev: "",
    prod: "",
  }[env],

  chatroomAccount: {
    dev: "",
    prod: "",
  }[env],

  stories: {
    dev: ["./**/*.stories.mdx", "../**/*.stories.@(js|jsx|ts|tsx)"],
    prod: ["./**/*.stories.prod.mdx", "./**/*.stories.prod.@(js|jsx|ts|tsx)"],
  }[env],

  initOptions: {
    appkey: "",
    token: "",
    account: "",
    debugLevel: "",
    lbsUrls: ["https://lbs.netease.im/lbs/webconf.jsp"],
    linkUrl: "weblink.netease.im",
  },

  loginOptions: {
    dev: {
      baseDomain: "",
      appKey: "",
      parentScope: 2,
      scope: 7,
    },
    prod: {
      baseDomain: "",
      appKey: "",
      parentScope: 2,
      scope: 7,
    },
  }[env],
};
