import React from 'react'
import { ComponentStory } from '@storybook/react'
import { Provider } from '../common'
import { AddContainer, SearchContainer } from './index'

import './add/style'
import './search/style'

export default {
  title: 'search-kit/index',
}

const Template: ComponentStory<typeof SearchContainer> = (args) => {
  return (
    <div
      style={{
        display: 'flex',
        width: 800,
        alignItems: 'center',
      }}
    >
      <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
        <SearchContainer
          commonPrefix={args.commonPrefix}
          prefix={args.prefix}
          onClickChat={args.onClickChat}
        />
        <div style={{ marginLeft: 20 }}>
          <AddContainer
            commonPrefix={args.commonPrefix}
            prefix={args.prefix}
            onClickChat={args.onClickChat}
          />
        </div>
      </Provider>
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'search',
  commonPrefix: 'common',
  onClickChat: () => {
    // 点击去聊天
  },
}
