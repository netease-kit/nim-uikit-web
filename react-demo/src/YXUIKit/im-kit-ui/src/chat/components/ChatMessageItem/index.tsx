import React, { Fragment, useRef } from 'react'
import { Dropdown, Menu, Tooltip } from 'antd'
import {
  LoadingOutlined,
  ExclamationCircleFilled,
  RollbackOutlined,
  DeleteOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import classNames from 'classnames'
import {
  ParseSession,
  ComplexAvatarContainer,
  MyAvatarContainer,
  useTranslation,
  CommonIcon,
  useStateContext,
} from '../../../common'
import { observer } from 'mobx-react'
import { MsgOperMenuItem } from '../../Container'
import { formatDate, getAIErrorMap, mergeActions } from '../../../utils'
import {
  V2NIMMessageForUI,
  YxTopMessage,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

export type MenuItemKey =
  | 'recall'
  | 'delete'
  | 'reply'
  | 'collection'
  | 'forward'
  | 'top'
  | 'unTop'
  | 'voiceToText'
  | string
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
  /** 置顶消息 */
  topMessage?: YxTopMessage
  /** 回复消息 */
  replyMsg?: V2NIMMessageForUI
  normalStatusRenderer?: React.ReactNode
  /** 消息右键操作菜单 */
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
    topMessage,
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
      errorCode,
      messageStatus,
      textOfVoice,
    } = msg

    const messageActionDropdownContainerRef = useRef<HTMLDivElement>(null)
    const messageAvatarActionDropdownContainerRef = useRef<HTMLDivElement>(null)

    const aiErrorMap = getAIErrorMap(t)

    // 优先级按照 备注 > 群昵称 > 好友昵称 > 消息上的昵称 > 好友账号
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

    // 重发消息
    const handleResendMsg = () => {
      onResend(msg)
    }

    // 消息发送状态
    const renderSendMsgStatus = () => {
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

    // 右键菜单列表
    const renderMenuItems = () => {
      const defaultMenuItems: MenuItem[] = [
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
          show: 1,
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
          show:
            [
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_SENDING,
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_FAILED,
            ].includes(sendingState) ||
            messageType === V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL
              ? 0
              : 1,
          label: t('collection'),
          key: 'collection',
          icon: <CommonIcon type="icon-shoucang" />,
        },
        {
          show:
            conversationType ===
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P ||
            [
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_SENDING,
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_FAILED,
            ].includes(sendingState) ||
            messageType ===
              V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL ||
            (topMessage?.idClient === messageClientId &&
              topMessage.operation === 0)
              ? 0
              : 1,
          label: t('topText'),
          key: 'top',
          icon: <CommonIcon type="icon-xiaoxizhiding" />,
        },
        {
          show:
            conversationType ===
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P ||
            [
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_SENDING,
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_FAILED,
            ].includes(sendingState) ||
            messageType === V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL
              ? 0
              : topMessage?.idClient === messageClientId &&
                topMessage.operation === 0
              ? 1
              : 0,
          label: t('unTopText'),
          key: 'unTop',
          icon: <CommonIcon type="icon-quxiaozhiding" />,
        },
        {
          show: msg.isSelf
            ? [
                V2NIMConst.V2NIMMessageSendingState
                  .V2NIM_MESSAGE_SENDING_STATE_SENDING,
                V2NIMConst.V2NIMMessageSendingState
                  .V2NIM_MESSAGE_SENDING_STATE_FAILED,
              ].includes(sendingState)
              ? 0
              : 1
            : 0,
          label: t('recallText'),
          key: 'recall',
          icon: <RollbackOutlined />,
        },
        {
          // 是语音消息则可以有转文字的功能.
          // 也因为 web 端无法发送语音消息, 故而也不用做其他的判断
          show:
            !textOfVoice &&
            messageType === V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO
              ? 1
              : 0,
          label: t('voiceToText'),
          key: 'voiceToText',
          icon: <CommonIcon type="icon-zhuanwenzi" />,
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

    return messageType ===
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS &&
      Object.keys(aiErrorMap)
        .map((item) => Number(item))
        .includes(messageStatus.errorCode) ? (
      <ParseSession msg={msg} prefix={commonPrefix} />
    ) : recallType === 'reCallMsg' || recallType === 'beReCallMsg' ? (
      <ParseSession
        msg={msg}
        prefix={commonPrefix}
        onReeditClick={onReeditClick}
      />
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
                <div className={`${_prefix}-status`}>
                  {renderSendMsgStatus()}
                </div>
              )}
              {renderMessageOuterContent?.(msg) ?? (
                <div className={`${_prefix}-body`}>
                  {renderMessageInnerContent?.(msg) ?? (
                    // 消息体的主要渲染逻辑都在这个ParseSession里
                    <ParseSession
                      replyMsg={replyMsg}
                      msg={msg}
                      prefix={commonPrefix}
                      showThreadReply={true}
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
              {formatDate(createTime)}
            </div>
          </div>
        </Dropdown>
      </div>
    )
  }
)

export default ChatMessageItem
