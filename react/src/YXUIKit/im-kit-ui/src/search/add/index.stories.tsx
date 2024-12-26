import React from 'react'
import { AddContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '../../common'

import './style'

export default {
  title: 'search-kit/AddDemo',
}

const Template: ComponentStory<typeof AddContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
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
