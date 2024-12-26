import React from 'react'
import { ConversationContainer } from './index'
import { Provider } from '../common'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'conversation-kit/Conversation',
}

const Template: ComponentStory<typeof ConversationContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <ConversationContainer {...args} />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'conversation',
  commonPrefix: 'common',
}
