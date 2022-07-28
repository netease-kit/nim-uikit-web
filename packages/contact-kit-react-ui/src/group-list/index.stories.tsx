import React from 'react'
import { GroupListContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '@xkit-yx/common-ui'

import './style'

export default {
  title: 'contact-kit/GroupList',
}

const Template: ComponentStory<typeof GroupListContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <GroupListContainer
        onItemClick={(teamId) => {
          console.log('群组列表被点击了：', teamId)
        }}
        {...args}
      />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'contact',
}
