const env = process.env.STORYBOOK_ENV || 'dev' // prod || dev

module.exports = {
  baseUrl: '',

  appKey: '',

  stories: {
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
  }[env],

  initOptions: {
    appkey: '',
    token: '',
    account: '',
    debugLevel: 'debug',
    lbsUrls: [''],
    linkUrl: '',
  },

  loginOptions: {
    baseDomain: '',
    appKey: '',
    parentScope: 2,
    scope: 7,
  },
}
