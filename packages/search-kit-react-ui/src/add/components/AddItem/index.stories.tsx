import React from 'react'
import { ComponentMeta } from '@storybook/react'
import AddItem, { AddItemProps } from './index'
import '../../style/addItem.less'

export default {
  title: 'search-kit/AddItem',
  component: AddItem,
} as ComponentMeta<typeof AddItem>

const props: AddItemProps = {
  scene: 'addFriend',
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
