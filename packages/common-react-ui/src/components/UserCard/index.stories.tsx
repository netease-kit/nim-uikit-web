import React from 'react'
import { UserCard } from './index'
import { Provider } from '../..'
import { ComponentStory, Meta } from '@storybook/react'

import './style'

export default {
  title: 'common/UserCard',
  argTypes: {
    relation: {
      control: 'select',
      options: ['stranger', 'friend', 'blacklist'],
    },
  },
} as Meta

const Template: ComponentStory<typeof UserCard> = (args) => {
  return (
    <Provider>
      <UserCard
        onAddFriendClick={() => {
          console.log('添加好友')
        }}
        onDeleteFriendClick={() => {
          console.log('删除好友')
        }}
        onBlockFriendClick={() => {
          console.log('拉黑好友')
        }}
        onRemoveBlockFriendClick={() => {
          console.log('解除拉黑')
        }}
        onSendMsglick={() => {
          console.log('发送消息')
        }}
        onCancel={() => {
          console.log('关闭弹窗')
        }}
        {...args}
      />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  visible: true,
  relation: 'friend',
  account: 'cs1',
  nick: 'Jack',
  gender: 'male',
  signature:
    '你来自来，去自去，你是自由的，风 都无法将你圈养你来自来，去自去，你是自由的，风都无法将你圈养都无',
  prefix: 'common',
}
