import React from 'react'
import { ComponentStory } from '@storybook/react'
import { Provider } from '@xkit-yx/common-ui'
import { AddContainer, SearchContainer } from './index'

import './add/style'
import './search/style'

export default {
  title: 'search-kit/index',
}

const Template: ComponentStory<typeof SearchContainer> = (args) => {
  const initOptions = {
    appkey: '45c6af3c98409b18a84451215d0bdd6e',
    token: 'e10adc3949ba59abbe56e057f20f883e',
    account: 'cs1',
    debugLevel: 'debug',
    lbsUrls: ['https://lbs.netease.im/lbs/webconf.jsp'],
    linkUrl: 'weblink.netease.im',
  }
  return (
    <div
      style={{
        display: 'flex',
        width: 800,
        alignItems: 'center',
      }}
    >
      <Provider initOptions={initOptions} sdkVersion={2}>
        <SearchContainer
          commonPrefix={args.commonPrefix}
          prefix={args.prefix}
          onClickChat={args.onClickChat}
        />
        <div style={{ marginLeft: 20 }}>
          <AddContainer
            commonPrefix={args.commonPrefix}
            prefix={args.prefix}
            onClickChat={args.onClickChat}
          />
        </div>
      </Provider>
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'search',
  commonPrefix: 'common',
  onClickChat: () => {
    // 点击去聊天
  },
}
