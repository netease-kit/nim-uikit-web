import React from 'react'
import { ComponentMeta } from '@storybook/react'
import CommonIcon from './index'

export default {
  title: 'common/CommonIcon',
  component: CommonIcon,
} as ComponentMeta<typeof CommonIcon>

export const Primary = () => {
  return (
    <div>
      <CommonIcon type="icon-jiaruqunzu" />
      <CommonIcon
        style={{ display: 'block', fontSize: '50px' }}
        type="icon-a-18"
      />
    </div>
  )
}
