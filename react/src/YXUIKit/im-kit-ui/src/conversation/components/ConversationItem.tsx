import React, { FC, ReactElement, useMemo } from 'react'
import moment from 'moment'
import { Dropdown } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import {
  CommonIcon,
  getMsgContentTipByType,
  useTranslation,
} from '../../common'
import { V2NIMLastMessage } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMConversationService'
import { V2NIMConst } from 'nim-web-sdk-ng'

export interface ConversationItemProps {
  isTop: boolean
  isMute: boolean
  conversationName: string
  menuRenderer: ReactElement
  avatarRenderer: ReactElement
  time: number
  lastMessage?: V2NIMLastMessage
  isSelected: boolean
  onItemClick: () => void
  renderConversationMsgIsRead?: () => void
  conversationNameRenderer?: JSX.Element | null
  conversationMsgRenderer?: JSX.Element | null
  beMentioned?: boolean
  prefix?: string
  commonPrefix?: string
}

export const ConversationItem: FC<ConversationItemProps> = ({
  isTop,
  isMute,
  conversationName,
  menuRenderer,
  avatarRenderer,
  time,
  lastMessage,
  beMentioned = false,
  isSelected = false,
  onItemClick,
  conversationMsgRenderer,
  conversationNameRenderer,
  renderConversationMsgIsRead,
  prefix = 'conversation',
}) => {
  const date = useMemo(() => {
    if (!time) {
      return ''
    }

    const _d = moment(time)
    const isCurrentDay = _d.isSame(moment(), 'day')
    const isCurrentYear = _d.isSame(moment(), 'year')

    return _d.format(
      isCurrentDay ? 'HH:mm' : isCurrentYear ? 'MM-DD' : 'YYYY-MM'
    )
  }, [time])

  const { t } = useTranslation()
  const msg = useMemo(() => {
    const {
      messageType,
      text = '',
      lastMessageState,
      sendingState,
    } = lastMessage || {}

    if (
      lastMessageState ===
      V2NIMConst.V2NIMLastMessageState.V2NIM_MESSAGE_STATUS_REVOKE
    ) {
      return t('recallMessageText')
    }

    if (messageType === void 0) {
      return ''
    }

    if (
      sendingState ===
      V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
    ) {
      return ''
    }

    if (
      sendingState ===
      V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
    ) {
      return <ExclamationCircleFilled style={{ color: 'red' }} />
    }

    return lastMessage ? getMsgContentTipByType({ messageType, text }, t) : ''
  }, [lastMessage, t])

  return (
    <Dropdown overlay={menuRenderer} trigger={['contextMenu']}>
      <div
        className={`${prefix}-item ${
          isSelected ? `${prefix}-item-select` : ''
        } ${isTop ? `${prefix}-item-top` : ''}`}
        onClick={onItemClick}
      >
        {avatarRenderer}
        <div className={`${prefix}-item-content`}>
          <div className={`${prefix}-item-content-name`}>
            {conversationNameRenderer ?? conversationName}
          </div>
          <div className={`${prefix}-item-content-msg`}>
            {beMentioned && (
              <span className={`${prefix}-item-content-mention`}>
                {t('beMentioned')}
              </span>
            )}
            {renderConversationMsgIsRead?.()}
            <div className={`${prefix}-item-content-msg-body`}>
              {conversationMsgRenderer ?? msg}
            </div>
          </div>
        </div>
        <div className={`${prefix}-item-state`}>
          <div className={`${prefix}-item-state-date`}>{date}</div>
          <div className={`${prefix}-item-state-mute`}>
            {isMute ? <CommonIcon type="icon-xiaoximiandarao" /> : null}
          </div>
        </div>
      </div>
    </Dropdown>
  )
}
