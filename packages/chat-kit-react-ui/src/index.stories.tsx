import React from 'react'
import { Provider } from '@xkit-yx/common-ui'
import { ChatContainer } from './Container'
import { ChatProvider } from './contextManager/Provider'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'chat-kit/Demo',
}

const initOptions = {
  appkey: '45c6af3c98409b18a84451215d0bdd6e',
  token: 'e10adc3949ba59abbe56e057f20f883e',
  account: 'cs1',
  debugLevel: 'debug',
  lbsUrls: ['https://lbs.netease.im/lbs/webconf.jsp'],
  linkUrl: 'weblink.netease.im',
}

const Template: ComponentStory<typeof ChatContainer> = (args) => {
  return (
    <div id="app" style={{ width: 800, height: 600 }}>
      <Provider initOptions={initOptions} sdkVersion={2}>
        <ChatProvider>
          <ChatContainer {...args} />
        </ChatProvider>
      </Provider>
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'chat',
  commonPrefix: 'common',
  selectedSession: {
    id: '123456789',
    scene: 'p2p',
    to: 'cs8',
    unread: 0,
    name: 'hello',
    account: 'cs1',
    createTime: Date.now(),
    updateTime: Date.now(),
    isMute: false,
  },
}
