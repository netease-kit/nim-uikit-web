import React, { useState } from 'react'
import { ComponentMeta } from '@storybook/react'
import JoinTeamModal from './index'
import '../../style/addModal.less'

export default {
  title: 'search-kit/JoinTeamModal',
  component: JoinTeamModal,
} as ComponentMeta<typeof JoinTeamModal>

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

  return <JoinTeamModal {...props} />
}
