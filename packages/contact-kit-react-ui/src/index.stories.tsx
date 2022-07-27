import React from 'react'
import { ContactListContainer } from './contact-list/Container'
import { ComponentStory } from '@storybook/react'
import { Provider, useStateContext } from '@xkit-yx/common-ui'
import { FriendListContainer } from './friend-list/Container'
import { BlackListContainer } from './black-list/Container'
import { GroupListContainer } from './group-list/Container'

import './friend-list/style'
import './black-list/style'
import './group-list/style'
import './contact-list/style'

export default {
  title: 'contact-kit/index',
}

const ContactInfo = ({ prefix }) => {
  const { nim, state, initOptions } = useStateContext()

  return (
    <div>
      {(() => {
        switch (state.selectedContactType) {
          case 'friendList':
            return <FriendListContainer prefix={prefix} />
          case 'blackList':
            return <BlackListContainer prefix={prefix} />
          case 'groupList':
            return <GroupListContainer prefix={prefix} />
          default:
            return null
        }
      })()}
    </div>
  )
}

const Template: ComponentStory<typeof ContactListContainer> = (args) => {
  return (
    <Provider>
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
          <ContactInfo prefix={args.prefix} />
        </div>
      </div>
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'contact',
}
