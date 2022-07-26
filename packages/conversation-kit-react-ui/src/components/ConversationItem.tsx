import React, { FC, ReactElement, useMemo } from 'react'
import moment from 'moment'
import { Dropdown } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { CommonIcon, ParseSession, useTranslation } from '@xkit-yx/common-ui'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'

export interface ConversationItemProps {
  isMute: boolean
  sessionName: string
  menuRenderer: ReactElement
  avatarRenderer: ReactElement
  time: number
  lastMsg: IMMessage | null | undefined
  isSelected: boolean
  onItemClick: () => void
  prefix?: string
  commonPrefix?: string
}

export const ConversationItem: FC<ConversationItemProps> = ({
  isMute,
  sessionName,
  menuRenderer,
  avatarRenderer,
  time,
  lastMsg,
  isSelected = false,
  onItemClick,
  prefix = 'conversation',
  commonPrefix = 'common',
}) => {
  const date = useMemo(() => {
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
    switch (type) {
      case 'text':
        return body || `[${t('textMsgText')}]`
      case 'audio':
        return `[${t('audioMsgText')}]`
      case 'custom':
        return <ParseSession msg={lastMsg!} prefix={commonPrefix} />
      case 'file':
        return `[${t('fileMsgText')}]`
      case 'g2':
        return `[${t('callMsgText')}]`
      case 'geo':
        return `[${t('geoMsgText')}]`
      case 'image':
        return `[${t('imgMsgText')}]`
      case 'notification':
        return `[${t('notiMsgText')}]`
      case 'robot':
        return `[${t('robotMsgText')}]`
      case 'tip':
        return `[${t('tipMsgText')}]`
      case 'video':
        return `[${t('videoMsgText')}]`
      default:
        return `[${t('unknowMsgText')}]`
    }
  }, [lastMsg, commonPrefix, t])

  return (
    <Dropdown overlay={menuRenderer} trigger={['contextMenu']}>
      <div
        className={`${prefix}-item ${
          isSelected ? `${prefix}-item-select` : ''
        }`}
        onClick={onItemClick}
      >
        {avatarRenderer}
        <div className={`${prefix}-item-content`}>
          <div className={`${prefix}-item-content-name`}>{sessionName}</div>
          <div className={`${prefix}-item-content-msg`}>{msg}</div>
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
