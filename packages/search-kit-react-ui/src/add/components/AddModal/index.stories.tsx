import React, { useState } from 'react'
import { ComponentMeta } from '@storybook/react'
import AddModal from './index'
import '../../style/addModal.less'

export default {
  title: 'search-kit/AddModel',
  component: AddModal,
} as ComponentMeta<typeof AddModal>

export const Primary = () => {
  const [visible, setVisible] = useState(true)
  const props = {
    title: '添加好友',
    visible: visible,
    handleOk: (account: string) => {
      return new Promise<void>(() => {
        /* empty */
      })
    },
    onCancel: () => setVisible(false),
    prefix: 'search',
  }
  return <AddModal {...props} />
}
