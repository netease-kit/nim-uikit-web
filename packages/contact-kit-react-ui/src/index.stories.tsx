import React from 'react'
import { ContactListContainer } from './contact-list/Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '@xkit-yx/common-ui'
import { ContactInfoContainer } from './contact-info/Container'

import './contact-list/style'
import './contact-info/style'

export default {
  title: 'contact-kit/index',
}

const Template: ComponentStory<typeof ContactListContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <div
        style={{
          display: 'flex',
          width: 1000,
          height: 400,
          alignItems: 'center',
        }}
      >
        <div style={{ width: 300, height: '100%' }}>
          <ContactListContainer {...args} />
        </div>
        <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
          <ContactInfoContainer prefix={args.prefix} />
        </div>
      </div>
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'contact',
}
