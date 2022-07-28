import React from 'react'
import { ConversationContainer } from './index'
import { Provider } from '@xkit-yx/common-ui'
import { ComponentStory } from '@storybook/react'
import Docs from './index.stories.prod.mdx'

import './style'

export default {
  title: 'IM UI Kit/会话列表组件',
  parameters: {
    docs: {
      page: Docs,
    },
  },
}

const Template: ComponentStory<typeof ConversationContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <div style={{ width: '30vw', height: '100%' }}>
        <ConversationContainer {...args} />
      </div>
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'conversation',
  commonPrefix: 'common',
  onSessionItemClick(id) {
    console.log('该会话被点击：', id)
  },
  onSessionItemDeleteClick(id) {
    console.log('该会话被删除：', id)
  },
  onSessionItemMuteChange(id, mute) {
    console.log('该会话免打扰状态改变：', id, mute)
  },
}
