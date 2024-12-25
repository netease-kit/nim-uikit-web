import React from 'react'
import { ComponentStory } from '@storybook/react'
import { Provider } from '../common'
import { AddContainer, SearchContainer } from './index'
import Docs from './index.stories.prod.mdx'

import './add/style'
import './search/style'

export default {
  title: 'IM UI Kit/搜索组件',
  parameters: {
    docs: {
      page: Docs,
    },
  },
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
