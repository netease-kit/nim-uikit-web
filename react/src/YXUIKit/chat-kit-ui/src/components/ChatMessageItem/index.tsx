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
  MyAvatarContainer,
  useTranslation,
  CommonIcon,
  useStateContext,
} from '../../../../common-ui/src'
import {
  // CopyOutlined,
  RollbackOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { observer } from 'mobx-react'

export type MenuItemKey = 'recall' | 'delete' | 'reply'

export interface MenuItem {
  show: 1 | 0
  label: string
  key: MenuItemKey
  icon: React.ReactNode
}

export interface MessageItemProps {
  myAccount: string
  teamId?: string
  msg: IMMessage
  normalStatusRenderer?: React.ReactNode
  msgs: IMMessage[]
  onResend: (msg: IMMessage) => void
  onReeditClick: (body: string) => void
  onMessageAction: (key: MenuItemKey, msg: IMMessage) => void
  prefix?: string
  commonPrefix?: string
}

export const ChatMessageItem: React.FC<MessageItemProps> = observer(
  ({
    teamId,
    msg,
    msgs,
    myAccount,
    normalStatusRenderer,
    onResend,
    onMessageAction,
    onReeditClick,
    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { t } = useTranslation()
    const { store } = useStateContext()
    const _prefix = `${prefix}-message-list-item`

    const { from, fromNick, body, attach, idClient, status, time, type, ext } =
      msg

    let replyMsg:
      | Pick<
          IMMessage,
          'type' | 'body' | 'attach' | 'idClient' | 'fromNick' | 'from'
        >
      | undefined
    if (ext) {
      try {
        const { yxReplyMsg } = JSON.parse(ext)
        if (yxReplyMsg) {
          replyMsg = msgs.find((m) => m.idClient === yxReplyMsg.idClient) ?? {
            fromNick: yxReplyMsg.fromNick,
            from: yxReplyMsg.from,
            type: yxReplyMsg.type,
            body: yxReplyMsg.body,
            idClient: yxReplyMsg.idClient,
          }
        }
      } catch {}
    }

    const isSelf = from === myAccount

    // 内存中插入的 msg 属性，具体内容参考 msg store
    const {
      type: attachType = '',
      canRecall = false,
      canEdit = false,
      oldBody = '',
    } = attach || { type: '', canRecall: false, canEdit: false, oldBody: '' }

    const renderSendStatus = () => {
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
      return normalStatusRenderer || null
    }

    const renderMsgDate = () => {
      const date = moment(time)
      const isCurrentDay = date.isSame(moment(), 'day')
      const isCurrentYear = date.isSame(moment(), 'year')
      return isCurrentDay
        ? date.format('HH:mm:ss')
        : isCurrentYear
        ? date.format('MM-DD HH:mm:ss')
        : date.format('YYYY-MM-DD HH:mm:ss')
    }
    const renderMenuItmes = () => {
      const menuItems: MenuItem[] = [
        // {
        //   label: '复制',
        //   key: 'copy',
        //   icon: <CopyOutlined />,
        // },
        {
          show: canRecall ? 1 : 0,
          label: t('recallText'),
          key: 'recall',
          icon: <RollbackOutlined />,
        },
        {
          show: ['sending', 'sendFailed', 'refused', 'delete'].includes(status)
            ? 0
            : 1,
          label: t('replyText'),
          key: 'reply',
          icon: <CommonIcon type="icon-huifu" />,
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

    const renderSpecialMsg = () => {
      return (
        <div key={idClient} className={`${_prefix}-recall`}>
          {attachType === 'reCallMsg' ? (
            <>
              {body}
              {canEdit ? (
                <span
                  className={`${_prefix}-reedit`}
                  onClick={() => onReeditClick(oldBody)}
                >
                  {t('reeditText')}
                </span>
              ) : null}
            </>
          ) : (
            `${
              isSelf
                ? t('you')
                : store.uiStore.getAppellation({ account: from, teamId })
            } ${t('recallMessageText')}`
          )}
        </div>
      )
    }

    return attachType === 'reCallMsg' || attachType === 'beReCallMsg' ? (
      renderSpecialMsg()
    ) : type === 'notification' ? (
      <ParseSession replyMsg={replyMsg} msg={msg} prefix={commonPrefix} />
    ) : (
      <div
        className={classNames(`${_prefix}-wrap`, {
          [`${_prefix}-self`]: isSelf,
        })}
      >
        <div className={`${_prefix}-avatar`}>
          {isSelf ? (
            <MyAvatarContainer prefix={commonPrefix} canClick={false} />
          ) : (
            <ComplexAvatarContainer prefix={commonPrefix} account={from} />
          )}
        </div>
        <Dropdown
          key={idClient}
          trigger={['contextMenu']}
          overlay={
            <Menu
              onClick={({ key }) => onMessageAction(key as MenuItemKey, msg)}
              items={renderMenuItmes()}
            />
          }
        >
          <div className={`${_prefix}-content-box`}>
            <div className={`${_prefix}-nick`}>
              {store.uiStore.getAppellation({ account: from, teamId })}
            </div>
            <div className={`${_prefix}-content`}>
              {isSelf && (
                <div className={`${_prefix}-status`}>{renderSendStatus()}</div>
              )}
              <div className={`${_prefix}-body`}>
                <ParseSession
                  replyMsg={replyMsg}
                  msg={msg}
                  prefix={commonPrefix}
                />
              </div>
            </div>
            <div
              className={classNames(`${_prefix}-date`, {
                [`${_prefix}-date-self`]: isSelf,
              })}
            >
              {renderMsgDate()}
            </div>
          </div>
        </Dropdown>
      </div>
    )
  }
)

export default ChatMessageItem
