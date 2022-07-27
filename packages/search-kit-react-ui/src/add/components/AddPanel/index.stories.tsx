import React from 'react'
import { ComponentMeta } from '@storybook/react'
import AddPanel from './index'
import '../../style/addPanel.less'

export default {
  title: 'search-kit/AddPanel',
  component: AddPanel,
} as ComponentMeta<typeof AddPanel>

const props = {
  trigger: 'click',
  onClick: (id: number) => console.log(id),
}

export const Primary = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <AddPanel {...props} />
    </div>
  )
}
