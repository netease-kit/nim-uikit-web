import React from 'react'
import { SearchContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '../../common'

import './style'

export default {
  title: 'search-kit/SearchDemo',
}

const Template: ComponentStory<typeof SearchContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <SearchContainer
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
