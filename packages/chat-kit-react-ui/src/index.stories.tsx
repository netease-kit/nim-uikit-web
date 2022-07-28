import React from 'react'
import { Provider } from '@xkit-yx/common-ui'
import { ChatContainer } from './Container'
import { ChatProvider } from './contextManager/Provider'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'chat-kit/Demo',
}

const Template: ComponentStory<typeof ChatContainer> = (args) => {
  return (
    <div id="app" style={{ width: 800, height: 600 }}>
      <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
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
