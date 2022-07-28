import React from 'react'
import { FriendListContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '@xkit-yx/common-ui'

import './style'

export default {
  title: 'contact-kit/FriendList',
}

const Template: ComponentStory<typeof FriendListContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <FriendListContainer
        onItemClick={(account) => {
          console.log('好友列表被点击了：', account)
        }}
        afterSendMsgClick={() => {
          console.log('发送消息回调触发')
        }}
        {...args}
      />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'contact',
  commonPrefix: 'common',
}
