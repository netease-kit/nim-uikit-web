import React, { useState } from 'react'
import { ComponentMeta } from '@storybook/react'
import AddFriendModal from './index'
import '../../style/addModal.less'

export default {
  title: 'search-kit/AddFriendModal',
  component: AddFriendModal,
} as ComponentMeta<typeof AddFriendModal>

export const Primary = () => {
  const [visible, setVisible] = useState(true)
  const props = {
    visible,
    onChat: (account: string) => {
      console.log('去聊天', account)
    },
    onCancel: () => setVisible(false),
    prefix: 'search',
    commonPrefix: 'common',
  }

  return <AddFriendModal {...props} />
}
