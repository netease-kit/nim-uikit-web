import React from 'react'
import { Provider } from '../..'
import { MyUserCard } from './index'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'common/MyUserCard',
}

const Template: ComponentStory<typeof MyUserCard> = (args) => {
  const handleSave = (params: any) => {
    console.log('保存回调: ', params)
  }

  const hanleCancel = () => {
    console.log('取消保存回调')
  }

  return (
    <Provider>
      <MyUserCard onSave={handleSave} onCancel={hanleCancel} {...args} />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  visible: true,
  account: 'cs1',
  nick: 'Jack',
  gender: 'male',
  signature:
    '你来自来，去自去，你是自由的，风 都无法将你圈养你来自来，去自去，你是自由的，风都无法将你圈养都无',
  prefix: 'common',
}
