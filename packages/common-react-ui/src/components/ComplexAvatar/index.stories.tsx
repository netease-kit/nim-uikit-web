import React from 'react'
import { ComplexAvatarContainer } from './index'
import { Provider } from '../../contextManager'
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
  account: 'cs1',
  nick: 'Jack',
  gender: 'male',
  count: 10,
  dot: true,
  signature:
    '你来自来，去自去，你是自由的，风 都无法将你圈养你来自来，去自去，你是自由的，风都无法将你圈养都无',
  prefix: 'common',
}
