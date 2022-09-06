import React from 'react'
import { ComplexAvatarContainer } from './index'
import { Provider } from '../../contextManager/Provider'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'common/ComplexAvatar',
  argTypes: {
    relation: {
      control: 'select',
      options: ['stranger', 'friend', 'blacklist', 'myself'],
    },
  },
}

const Template: ComponentStory<typeof ComplexAvatarContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <ComplexAvatarContainer {...args} />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  canClick: true,
  account: 'cs1',
  count: 10,
  dot: true,
  size: 36,
  prefix: 'common',
}
