import React from 'react'
import { Dropdown, Menu, Tooltip } from 'antd'
import {
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons'
import classNames from 'classnames'
import moment from 'moment'
import {
  ParseSession,
  ComplexAvatarContainer,
  useTranslation,
} from '@xkit-yx/common-ui'
import {
  // CopyOutlined,
  RollbackOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { ResendMsgOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { IMessage, ICustomMessageInfo, IMMessageInfo } from '../../types'

export interface MessageItemProps {
  prefix?: string
  commonPrefix?: string
  messageItem: IMessage
  account: string
  onResend: (props: ResendMsgOptions) => void
  onReeditClick: (body: string) => void
  onMessageAction: (action: string, msg: IMMessageInfo) => void
}

export const ChatMessageItem: React.FC<MessageItemProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  messageItem,
  account,
  onResend,
  onMessageAction,
  onReeditClick,
}) => {
  const { t } = useTranslation()
  const _prefix = `${prefix}-message-list-item`

  const renderSendStatus = (msg) => {
    const { status } = msg
    if (status === 'sending') {
      return <LoadingOutlined className={`${_prefix}-status-icon`} />
    }
    if (status === 'read') {
      return <CheckCircleOutlined className={`${_prefix}-status-icon`} />
    }
    if (status === 'sendFailed') {
      return (
        <Tooltip title={t('sendMsgFailedText')}>
          <ExclamationCircleFilled
            className={`${_prefix}-status-icon-fail`}
            onClick={() => onResend(msg)}
          />
        </Tooltip>
      )
    }
    if (status === 'refused') {
      return (
        <Tooltip title={t('sendBlackFailedText')}>
          <ExclamationCircleFilled
            className={`${_prefix}-status-icon-fail`}
            onClick={() => onResend(msg)}
          />
        </Tooltip>
      )
    }
    return null
  }

  const renderMsgDate = (msg) => {
    const { time } = msg
    const date = moment(time)
    const isCurrentDay = date.isSame(moment(), 'day')
    const isCurrentYear = date.isSame(moment(), 'year')
    return isCurrentDay
      ? date.format('HH:mm:ss')
      : isCurrentYear
      ? date.format('MM-DD HH:mm:ss')
      : date.format('YYYY-MM-DD HH:mm:ss')
  }

  const renderMenuItmes = (msg) => {
    const menuItems = [
      // {
      //   label: '复制',
      //   key: 'copy',
      //   icon: <CopyOutlined />,
      // },
      {
        show: msg.showRecall ? 1 : 0,
        label: t('recallText'),
        key: 'recall',
        icon: <RollbackOutlined />,
      },
      {
        show: 1,
        label: t('deleteText'),
        key: 'delete',
        icon: <DeleteOutlined />,
      },
    ]
    return menuItems.filter((item) => item.show)
  }

  const renderSpecialMsg = (msg: ICustomMessageInfo, isSelf) => {
    const { fromNick = '', body = '' } = msg
    const name = isSelf ? t('you') : fromNick
    const recallMsg = `${name}${t('recallMessageText')}`

    if (msg.specialType === 'recall') {
      return <>{recallMsg}</>
    }
    if (msg.specialType === 'reedit') {
      return (
        <>
          {recallMsg}
          <span
            className={`${_prefix}-reedit`}
            onClick={() => onReeditClick(body)}
          >
            {t('reeditText')}
          </span>
        </>
      )
    }
    return null
  }

  const render = (msg: IMessage) => {
    const isSelf = account === msg.from
    const key = msg.idClient
    const speMsg = { ...msg } as ICustomMessageInfo
    if (speMsg.specialType) {
      return (
        <div key={key} className={`${_prefix}-recall`}>
          {renderSpecialMsg(speMsg, isSelf)}
        </div>
      )
    }

    const norMsg = { ...msg } as IMMessageInfo
    return (
      <div
        className={classNames(`${_prefix}-wrap`, {
          [`${_prefix}-self`]: isSelf,
        })}
      >
        <div className={`${_prefix}-avatar`}>
          <ComplexAvatarContainer
            prefix={commonPrefix}
            size={36}
            account={norMsg.from}
            nick={norMsg.fromNick || norMsg.nick}
            gender={norMsg.gender}
            signature={norMsg.signature}
            tel={norMsg.tel}
            email={norMsg.email}
            avatar={norMsg.avatar}
          />
        </div>
        <Dropdown
          key={key}
          trigger={['contextMenu']}
          overlay={
            <Menu
              onClick={({ key }) => onMessageAction(key, norMsg)}
              items={renderMenuItmes(norMsg)}
            />
          }
        >
          <div className={`${_prefix}-content-box`}>
            <div className={`${_prefix}-nick`}>
              {norMsg.fromNick || norMsg.account}
            </div>
            <div className={`${_prefix}-content`}>
              {isSelf && (
                <div className={`${_prefix}-status`}>
                  {renderSendStatus(norMsg)}
                </div>
              )}
              <div className={`${_prefix}-body`}>
                <ParseSession msg={norMsg} prefix={commonPrefix} />
              </div>
            </div>
            {
              <div
                className={classNames(`${_prefix}-date`, {
                  [`${_prefix}-date-self`]: isSelf,
                })}
              >
                {renderMsgDate(norMsg)}
              </div>
            }
          </div>
        </Dropdown>
      </div>
    )
  }

  return render(messageItem)
}

export default ChatMessageItem
