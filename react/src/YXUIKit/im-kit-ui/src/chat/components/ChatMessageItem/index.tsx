import React, { Fragment, useRef } from 'react'
import { Dropdown, Menu, Tooltip } from 'antd'
import { LoadingOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import classNames from 'classnames'
import moment from 'moment'
import {
  ParseSession,
  ComplexAvatarContainer,
  MyAvatarContainer,
  useTranslation,
  CommonIcon,
  useStateContext,
} from '../../../common'
import { RollbackOutlined, DeleteOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { MsgOperMenuItem } from '../../Container'
import { mergeActions } from '../../../utils'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng'

export type MenuItemKey = 'recall' | 'delete' | 'reply' | 'forward' | string
export type AvatarMenuItem = 'mention'

export interface MenuItem {
  // 是否显示
  show?: 1 | 0
  // 名称
  label?: string
  // 唯一 key
  key: MenuItemKey
  // 图标
  icon?: React.ReactNode
}

export interface MessageItemProps {
  msg: V2NIMMessageForUI
  replyMsg?: V2NIMMessageForUI
  normalStatusRenderer?: React.ReactNode
  msgOperMenu?: MsgOperMenuItem[]
  onReeditClick: (msg: V2NIMMessageForUI) => void
  onResend: (msg: V2NIMMessageForUI) => void
  onMessageAction: (key: MenuItemKey, msg: V2NIMMessageForUI) => void
  onMessageAvatarAction?: (key: AvatarMenuItem, msg: V2NIMMessageForUI) => void
  renderMessageAvatar?: (
    msg: V2NIMMessageForUI
  ) => JSX.Element | null | undefined
  renderMessageName?: (msg: V2NIMMessageForUI) => JSX.Element | null | undefined
  renderMessageOuterContent?: (
    msg: V2NIMMessageForUI
  ) => JSX.Element | null | undefined
  renderMessageInnerContent?: (
    msg: V2NIMMessageForUI
  ) => JSX.Element | null | undefined
  prefix?: string
  commonPrefix?: string
}

export const ChatMessageItem: React.FC<MessageItemProps> = observer(
  ({
    msg,
    replyMsg,
    normalStatusRenderer,
    msgOperMenu,
    onMessageAction,
    onMessageAvatarAction,
    onReeditClick,
    onResend,
    renderMessageAvatar,
    renderMessageName,
    renderMessageOuterContent,
    renderMessageInnerContent,
    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { t } = useTranslation()
    const { store } = useStateContext()

    const _prefix = `${prefix}-message-list-item`

    const {
      text,
      senderId,
      receiverId,
      messageClientId,
      sendingState,

      uploadProgress,
      createTime,
      messageType,
      conversationType,
      isSelf,
      recallType = '',
      canRecall = false,
      canEdit = false,
      errorCode,
    } = msg

    const messageActionDropdownContainerRef = useRef<HTMLDivElement>(null)
    const messageAvatarActionDropdownContainerRef = useRef<HTMLDivElement>(null)

    const nick = store.uiStore.getAppellation({
      account: senderId,
      teamId:
        conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
          ? receiverId
          : undefined,
    })

    const nickWithoutAlias = store.uiStore.getAppellation({
      account: senderId,
      teamId:
        conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
          ? receiverId
          : undefined,
      ignoreAlias: true,
    })

    const handleResendMsg = () => {
      onResend(msg)
    }

    const renderSendStatus = () => {
      if (
        sendingState ===
        V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
      ) {
        return <LoadingOutlined className={`${_prefix}-status-icon`} />
      }
      if (
        sendingState ===
        V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
      ) {
        const title =
          errorCode === 102426
            ? t('sendBlackFailedText')
            : errorCode === 104404
            ? t('sendNotFriendFailedText')
            : t('sendMsgFailedText')
        return (
          <Tooltip title={title}>
            <ExclamationCircleFilled
              className={`${_prefix}-status-icon-fail`}
              onClick={handleResendMsg}
            />
          </Tooltip>
        )
      }
      return normalStatusRenderer || null
    }

    const renderMsgDate = () => {
      const date = moment(createTime)
      const isCurrentDay = date.isSame(moment(), 'day')
      const isCurrentYear = date.isSame(moment(), 'year')
      return isCurrentDay
        ? date.format('HH:mm:ss')
        : isCurrentYear
        ? date.format('MM-DD HH:mm:ss')
        : date.format('YYYY-MM-DD HH:mm:ss')
    }

    const renderMenuItems = () => {
      const defaultMenuItems: MenuItem[] = [
        // {
        //   label: '复制',
        //   key: 'copy',
        //   icon: <CopyOutlined />,
        // },
        {
          show: [
            V2NIMConst.V2NIMMessageSendingState
              .V2NIM_MESSAGE_SENDING_STATE_SENDING,
            V2NIMConst.V2NIMMessageSendingState
              .V2NIM_MESSAGE_SENDING_STATE_FAILED,
          ].includes(sendingState)
            ? 0
            : 1,
          label: t('replyText'),
          key: 'reply',
          icon: <CommonIcon type="icon-huifu" />,
        },
        {
          show: uploadProgress === void 0 ? 1 : 0,
          label: t('deleteText'),
          key: 'delete',
          icon: <DeleteOutlined />,
        },
        {
          show:
            [
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_SENDING,
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_FAILED,
            ].includes(sendingState) ||
            messageType === V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO
              ? 0
              : 1,
          label: t('forwardText'),
          key: 'forward',
          icon: <CommonIcon type="icon-zhuanfa" />,
        },
        {
          show: canRecall ? 1 : 0,
          label: t('recallText'),
          key: 'recall',
          icon: <RollbackOutlined />,
        },
      ]
      const menuItems = msgOperMenu
        ? mergeActions(defaultMenuItems, msgOperMenu, 'key')
        : defaultMenuItems
      return menuItems.filter((item) => item.show)
    }

    const renderAvatarMenuItems = () => {
      return [
        {
          // @ts-ignore: 需求导致不需要 群备注
          label: `@${nickWithoutAlias}`,
          key: 'mention',
        },
      ]
    }

    const renderSpecialMsg = () => {
      return (
        <div key={messageClientId} className={`${_prefix}-recall`}>
          {recallType === 'reCallMsg' ? (
            <>
              {`${t('you')}${t('recallMessageText')}`}
              {canEdit ? (
                <span
                  className={`${_prefix}-reedit`}
                  onClick={() => onReeditClick(msg)}
                >
                  {t('reeditText')}
                </span>
              ) : null}
            </>
          ) : (
            `${isSelf ? t('you') : nick} ${t('recallMessageText')}`
          )}
        </div>
      )
    }

    return recallType === 'reCallMsg' || recallType === 'beReCallMsg' ? (
      renderSpecialMsg()
    ) : messageType ===
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION ? (
      <ParseSession replyMsg={replyMsg} msg={msg} prefix={commonPrefix} />
    ) : (
      <div
        className={classNames(`${_prefix}-wrap`, {
          [`${_prefix}-self`]: isSelf,
        })}
      >
        {renderMessageAvatar?.(msg) ?? (
          <div className={`${_prefix}-avatar`}>
            {isSelf ? (
              <MyAvatarContainer prefix={commonPrefix} canClick={false} />
            ) : (
              <Dropdown
                key={messageClientId}
                trigger={['contextMenu']}
                overlay={
                  onMessageAvatarAction ? (
                    <Menu
                      onClick={({ key }) =>
                        onMessageAvatarAction?.(key as AvatarMenuItem, msg)
                      }
                      items={renderAvatarMenuItems()}
                    />
                  ) : (
                    <Fragment />
                  )
                }
                getPopupContainer={(triggerNode) =>
                  messageAvatarActionDropdownContainerRef.current || triggerNode
                }
              >
                <div
                  className={`${_prefix}-avatar-wrap`}
                  ref={messageAvatarActionDropdownContainerRef}
                >
                  <ComplexAvatarContainer
                    prefix={commonPrefix}
                    account={senderId}
                  />
                </div>
              </Dropdown>
            )}
          </div>
        )}

        <Dropdown
          key={messageClientId}
          trigger={['contextMenu']}
          overlay={
            <Menu
              onClick={({ key }) => onMessageAction(key as MenuItemKey, msg)}
              items={renderMenuItems()}
            />
          }
          getPopupContainer={(triggerNode) =>
            messageActionDropdownContainerRef.current || triggerNode
          }
        >
          <div
            className={`${_prefix}-content-box`}
            ref={messageActionDropdownContainerRef}
          >
            {renderMessageName?.(msg) ?? (
              <div className={`${_prefix}-nick`}>{nick}</div>
            )}
            <div className={`${_prefix}-content`}>
              {isSelf && (
                <div className={`${_prefix}-status`}>{renderSendStatus()}</div>
              )}
              {renderMessageOuterContent?.(msg) ?? (
                <div className={`${_prefix}-body`}>
                  {renderMessageInnerContent?.(msg) ?? (
                    <ParseSession
                      replyMsg={replyMsg}
                      msg={msg}
                      prefix={commonPrefix}
                    />
                  )}
                </div>
              )}
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
