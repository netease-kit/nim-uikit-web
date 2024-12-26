import React from 'react'
import { Provider } from '../..'
import { ReadPercent } from './index'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'common/ReadPercent',
}

const Template: ComponentStory<typeof ReadPercent> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <ReadPercent {...args} />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  unread: 10,
  read: 0,
  hoverable: true,
  radius: 8,
  prefix: 'common',
}
