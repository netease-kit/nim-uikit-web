import React from 'react'
import { MsgListContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '../../common'

import './style'

export default {
  title: 'contact-kit/MsgList',
}

const Template: ComponentStory<typeof MsgListContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <MsgListContainer {...args} />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'contact',
  commonPrefix: 'common',
}
