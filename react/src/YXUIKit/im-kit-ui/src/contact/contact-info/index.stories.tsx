import React from 'react'
import { ContactInfoContainer } from './Container'
import { ComponentStory } from '@storybook/react'
import { Provider } from '../../common'

import './style'

export default {
  title: 'contact-kit/ContactInfo',
}

const Template: ComponentStory<typeof ContactInfoContainer> = (args) => {
  return (
    <Provider sdkVersion={2} initOptions={process.env.INIT_OPTIONS as any}>
      <ContactInfoContainer {...args} />
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'contact',
  commonPrefix: 'common',
}
