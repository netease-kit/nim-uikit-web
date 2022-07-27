import React from 'react'
import { AddContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '@xkit-yx/common-ui'

import './style'

export default {
  title: 'search-kit/AddDemo',
}

const Template: ComponentStory<typeof AddContainer> = (args) => {
  return (
    <Provider>
      <AddContainer
        {...args}
        onClickChat={() => {
          console.log('点击去聊天')
        }}
      />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'search',
}
