import React from 'react'
import { ContactListContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '@xkit-yx/common-ui'

import './style'

export default {
  title: 'contact-kit/ContactList',
}

const Template: ComponentStory<typeof ContactListContainer> = (args) => {
  return (
    <Provider>
      <ContactListContainer {...args} />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'contact',
}
