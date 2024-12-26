import React from 'react'
import { BlackListContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '../../common'

import './style'

export default {
  title: 'contact-kit/BlackList',
}

const Template: ComponentStory<typeof BlackListContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <BlackListContainer
        onItemClick={(account) => {
          console.log('黑名单列表被点击了：', account)
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
