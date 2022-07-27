import React from 'react'
import { ParseSession } from './index'
import { ComponentStory } from '@storybook/react'

import './style'

export default {
  title: 'common/ParseSession',
}

const Template: ComponentStory<typeof ParseSession> = (args) => {
  return <ParseSession {...args} />
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'common',
  msg: {
    body: 'w12[嘻嘻]12313[吐舌]',
    sessionId: '12',
    flow: 'out',
    target: 'cs4',
    status: 'sent',
    scene: 'p2p',
    to: 'cs5',
    from: 'cs1',
    time: 1656055971044,
    userUpdateTime: 1656055971044,
    type: 'custom',
    feature: 'default',
    idClient: 'sqweqwewqidj108309123890123',
  },
}
