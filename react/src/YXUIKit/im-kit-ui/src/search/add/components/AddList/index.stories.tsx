import React from 'react'
import { ComponentMeta } from '@storybook/react'
import AddList, { AddListProps } from './index'
import '../../style/addList.less'

export default {
  title: 'search-kit/AddList',
  component: AddList,
} as ComponentMeta<typeof AddList>

const props: AddListProps = {
  list: [
    {
      scene: 'addFriend',
      icon: 'icon-tianjiahaoyou',
      content: '添加好友',
      onClick: (id: string | number) => console.log(id),
    },
    {
      scene: 'createTeam',
      icon: 'icon-chuangjianqunzu',
      content: '创建群组',
      onClick: (id: string | number) => console.log(id),
    },
    {
      scene: 'joinTeam',
      icon: 'icon-jiaruqunzu',
      content: '加入群组',
      onClick: (id: string | number) => console.log(id),
    },
  ],
  prefix: 'search',
}

export const Primary = () => {
  return (
    <div>
      <AddList {...props} />
    </div>
  )
}
