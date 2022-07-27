import React from 'react'
import { ComponentMeta } from '@storybook/react'
import AddList from './index'
import '../../style/addList.less'

export default {
  title: 'search-kit/AddList',
  component: AddList,
} as ComponentMeta<typeof AddList>

const friend = {
  id: 1,
  icon: 'icon-tianjiahaoyou',
  content: '添加好友',
  onClick: (id: string | number) => console.log(id),
}

const groupChat = {
  id: 2,
  icon: 'icon-chuangjianqunzu',
  content: '创建群组',
  onClick: (id: string | number) => console.log(id),
}
const group = {
  id: 3,
  icon: 'icon-jiaruqunzu',
  content: '加入群组',
  onClick: (id: string | number) => console.log(id),
}

const props = {
  list: [friend, groupChat, group],
  prefix: 'search',
}

export const Primary = () => {
  return (
    <div>
      <AddList {...props} />
    </div>
  )
}
