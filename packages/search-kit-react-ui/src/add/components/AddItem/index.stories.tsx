import React from 'react'
import { ComponentMeta } from '@storybook/react'
import AddItem from './index'
import '../../style/addItem.less'

export default {
  title: 'search-kit/AddItem',
  component: AddItem,
} as ComponentMeta<typeof AddItem>

const props = {
  id: 1,
  icon: 'icon-tianjiahaoyou',
  content: '添加好友',
  onClick: (id: string | number) => console.log(id),
  prefix: 'search',
}

export const Primary = () => {
  return (
    <div>
      <AddItem {...props} />
    </div>
  )
}
