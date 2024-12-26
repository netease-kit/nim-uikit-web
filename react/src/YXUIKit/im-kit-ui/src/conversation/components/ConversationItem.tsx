import React, { FC, ReactElement, useMemo } from 'react'
import moment from 'moment'
import { Dropdown } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import {
  CommonIcon,
  getMsgContentTipByType,
  useTranslation,
} from '../../common'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'

export interface ConversationItemProps {
  isTop: boolean
  isMute: boolean
  sessionName: string
  menuRenderer: ReactElement
  avatarRenderer: ReactElement
  time: number
  lastMsg: IMMessage | null | undefined
  isSelected: boolean
  id: string
  onItemClick: () => void
  renderSessionMsgIsRead?: () => void
  sessionNameRenderer?: JSX.Element | null
  sessionMsgRenderer?: JSX.Element | null
  beMentioned?: boolean
  aitMsgs?: string[]
  prefix?: string
  commonPrefix?: string
}

export const ConversationItem: FC<ConversationItemProps> = ({
  isTop,
  isMute,
  sessionName,
  menuRenderer,
  avatarRenderer,
  id,
  time,
  lastMsg,
  beMentioned = false,
  aitMsgs = [],
  isSelected = false,
  onItemClick,
  sessionMsgRenderer,
  sessionNameRenderer,
  renderSessionMsgIsRead,
  prefix = 'conversation',
  commonPrefix = 'common',
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
    const { type = '', body = '', status } = lastMsg || {}

    if (!type) {
      return ''
    }
    if (status === 'sending') {
      return ''
    }
    if (status === 'sendFailed' || status === 'refused') {
      return <ExclamationCircleFilled style={{ color: 'red' }} />
    }
    return lastMsg ? getMsgContentTipByType(lastMsg, t) : ''
  }, [lastMsg, t])

  const isMentioned = useMemo(() => {
    return aitMsgs.length > 0
  }, [aitMsgs])

  return (
    <Dropdown overlay={menuRenderer} trigger={['contextMenu']}>
      <div
        className={`${prefix}-item ${
          isSelected ? `${prefix}-item-select` : ''
        } ${isTop ? `${prefix}-item-top` : ''}`}
        onClick={onItemClick}
        id={id}
      >
        {avatarRenderer}
        <div className={`${prefix}-item-content`}>
          <div className={`${prefix}-item-content-name`}>
            {sessionNameRenderer ?? sessionName}
          </div>
          <div className={`${prefix}-item-content-msg`}>
            {isMentioned && (
              <span className={`${prefix}-item-content-mention`}>
                {t('beMentioned')}
              </span>
            )}
            {renderSessionMsgIsRead?.()}
            <div className={`${prefix}-item-content-msg-body`}>
              {sessionMsgRenderer ?? msg}
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
