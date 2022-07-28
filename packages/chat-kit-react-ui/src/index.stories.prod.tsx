import React from 'react'
import { Provider } from '@xkit-yx/common-ui'
import { ChatContainer, ChatProvider, ChatMessageItem } from './index'
import { ComponentStory } from '@storybook/react'
import Docs from './index.stories.prod.mdx'
import './style'

export default {
  title: 'IM UI Kit/聊天组件',
  parameters: {
    docs: {
      page: Docs,
    },
  },
}

// const renderCustomMessage = ({
//   msg,
//   onResend,
//   onMessageAction,
//   onReeditClick,
// }) => {
//   return (
//     <div className="chat-item-test">
//       <ChatMessageItem
//         messageItem={msg}
//         onResend={() => {
//           onResend({ msg })
//           // 自定义
//         }}
//         onReeditClick={(body) => {
//           onReeditClick(body)
//           // 自定义
//         }}
//         onMessageAction={(key, msg) => {
//           onMessageAction(key, msg)
//           // 自定义
//         }}
//         account={initOptions.account}
//       />
//     </div>
//   )
// }

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
