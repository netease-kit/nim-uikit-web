import React from 'react'
import { CrudeAvatar } from './index'
import { UserOutlined } from '@ant-design/icons'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'common/CrudeAvatar',
}

const Template: ComponentStory<typeof CrudeAvatar> = (args) => {
  return <CrudeAvatar icon={<UserOutlined />} {...args} />
}

export const Primary = Template.bind({})

Primary.args = {
  account: 'cs1',
  nick: 'Jack',
  avatar: '',
  size: 36,
  count: 10,
  dot: true,
}
