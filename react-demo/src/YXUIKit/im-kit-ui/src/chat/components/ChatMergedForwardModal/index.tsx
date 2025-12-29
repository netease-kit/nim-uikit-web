import React, { FC } from 'react'
import { Modal } from 'antd'
import { observer } from 'mobx-react'
import { useTranslation } from '../../../common'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import ChatMessageItem from '../ChatMessageItem'

const _prefix = `chat-merged-forward-modal`

const ChatMergedForwardModal: FC<{
  title?: string
  visible: boolean
  msgs?: V2NIMMessageForUI[]
  onCancel: () => void
}> = observer(({ title, visible, onCancel, msgs }) => {
  const { t } = useTranslation()

  const noop = () => {
    // do nothing
  }

  return (
    <Modal
      className={_prefix}
      width={720}
      title={title || t('chatHistoryText')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      destroyOnClose
    >
      <div className={`${_prefix}-content`}>
        {(msgs || []).map((msg) => (
          <ChatMessageItem
            key={msg.messageClientId}
            msg={msg}
            onReeditClick={noop}
            onResend={noop}
            onMessageAction={noop}
            disableContextMenu
          />
        ))}
      </div>
    </Modal>
  )
})

export default ChatMergedForwardModal
