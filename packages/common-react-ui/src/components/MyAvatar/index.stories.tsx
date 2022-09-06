import React from 'react'
import { MyAvatarContainer } from './Container'
import { Provider } from '../../contextManager/Provider'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'common/MyAvatar',
  argTypes: {
    relation: {
      control: 'select',
      options: ['stranger', 'friend', 'blacklist', 'myself'],
    },
  },
}

const Template: ComponentStory<typeof MyAvatarContainer> = () => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <MyAvatarContainer />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {}
