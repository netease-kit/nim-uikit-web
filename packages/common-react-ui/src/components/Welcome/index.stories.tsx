import React from 'react'
import { Provider } from '../..'
import { Welcome } from './index'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'common/Welcome',
}

const Template: ComponentStory<typeof Welcome> = (args) => {
  return (
    <Provider>
      <div style={{ width: 420, height: 310, border: '1px solid #333' }}>
        <Welcome {...args} />
      </div>
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'common',
}
