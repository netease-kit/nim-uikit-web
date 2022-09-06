import React, { useState } from 'react'
import { ComponentMeta } from '@storybook/react'
import CreateModal from './index'

import '../../style/createModal.less'

export default {
  title: 'search-kit/CreateModal',
  component: CreateModal,
} as ComponentMeta<typeof CreateModal>

export const Primary = () => {
  const [visible, setVisible] = useState(true)
  const props = {
    visible,
    onChat: (teamId: string) => {
      console.log('去聊天', teamId)
    },
    onCancel: () => setVisible(false),
    prefix: 'search',
    commonPrefix: 'common',
  }
  return <CreateModal {...props} />
}
