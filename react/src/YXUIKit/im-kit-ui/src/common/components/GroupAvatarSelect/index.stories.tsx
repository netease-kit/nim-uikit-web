import React from 'react'
import { GroupAvatarSelect } from './index'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'common/GroupAvatarSelect',
}

const Template: ComponentStory<typeof GroupAvatarSelect> = (args) => {
  return (
    <GroupAvatarSelect
      {...args}
      onSelect={(url) => {
        console.log('切换群头像：', url)
      }}
    />
  )
}

export const Primary = Template.bind({})

Primary.args = {
  account: '1234',
  nick: '群组名称',
  avatar: '',
  size: 36,
  count: 0,
  dot: false,
  prefix: 'common',
}
