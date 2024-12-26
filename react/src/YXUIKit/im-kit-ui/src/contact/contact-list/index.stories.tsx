import React from 'react'
import { ContactListContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '../../common'

import './style'

export default {
  title: 'contact-kit/ContactList',
}

const Template: ComponentStory<typeof ContactListContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <ContactListContainer {...args} />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'contact',
}
