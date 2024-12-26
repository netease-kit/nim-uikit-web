import React from 'react'
import { Provider } from '../common'
import { ChatContainer } from './'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'chat-kit/Demo',
}

const Template: ComponentStory<typeof ChatContainer> = (args) => {
  return (
    <div id="app" style={{ width: 800, height: 600 }}>
      <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
        <ChatContainer {...args} />
      </Provider>
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'chat',
  commonPrefix: 'common',
  selectedSession: 'p2p-cs8',
}
