import React from 'react'
import { ConversationContainer } from './index'
import { Provider } from '@xkit-yx/common-ui'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'conversation-kit/Conversation',
}

const Template: ComponentStory<typeof ConversationContainer> = (args) => {
  return (
    <Provider>
      <ConversationContainer {...args} />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'conversation',
  commonPrefix: 'common',
}
