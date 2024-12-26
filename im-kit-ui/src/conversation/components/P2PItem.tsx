import React, { FC, useMemo } from 'react'
import { Menu } from 'antd'
import {
  ComplexAvatarContainer,
  CommonIcon,
  useTranslation,
  useStateContext,
  ReadPercent,
} from '../../common'
import { ConversationItem } from './ConversationItem'
import { observer } from 'mobx-react'
import { V2NIMConversationForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

export interface P2PItemProps extends V2NIMConversationForUI {
  isSelected: boolean
  onStickTopChange: (isTop: boolean) => void
  onDeleteClick: () => void
  onMuteChange: (mute: boolean) => void
  onItemClick: () => void
  avatarRenderer?: JSX.Element | null
  conversationNameRenderer?: JSX.Element | null
  conversationMsgRenderer?: JSX.Element | null
  msgReceiptTime?: number

  prefix?: string
  commonPrefix?: string
}

export const P2PItem: FC<P2PItemProps> = observer(
  ({
    onStickTopChange,
    onDeleteClick,
    onMuteChange,
    onItemClick,
    conversationId,
    mute = false,
    stickTop,
    lastMessage,
    unreadCount,
    updateTime,
    isSelected,
    avatarRenderer,
    conversationMsgRenderer,
    conversationNameRenderer,
    prefix = 'conversation',
    commonPrefix = 'common',
    msgReceiptTime,
  }) => {
    const { t } = useTranslation()
    const { nim, store, localOptions } = useStateContext()

    const to =
      nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)

    const menuRenderer = useMemo(() => {
      const items = [
        {
          label: stickTop ? t('deleteStickTopText') : t('addStickTopText'),
          icon: stickTop ? (
            <CommonIcon type="icon-quxiaozhiding" />
          ) : (
            <CommonIcon type="icon-xiaoxizhiding" />
          ),
          key: 'stickTop',
        },
        {
          label: mute ? t('unmuteSessionText') : t('muteSessionText'),
          icon: mute ? (
            <CommonIcon type="icon-quxiaoxiaoximiandarao" />
          ) : (
            <CommonIcon type="icon-xiaoximiandarao" />
          ),
          key: 'muteConversation',
        },
        {
          label: t('deleteSessionText'),
          icon: <CommonIcon type="icon-shanchu" />,
          key: 'deleteConversation',
        },
      ] as any

      return (
        <Menu
          onClick={({ key, domEvent }) => {
            domEvent.stopPropagation()
            switch (key) {
              case 'stickTop':
                onStickTopChange(!stickTop)
                break
              case 'muteConversation':
                onMuteChange(!mute)
                break
              case 'deleteConversation':
                onDeleteClick()
                break
              default:
                break
            }
          }}
          items={items}
        ></Menu>
      )
    }, [mute, stickTop, onStickTopChange, onDeleteClick, onMuteChange, t])

    const renderSessionMsgIsRead = () => {
      return localOptions.p2pMsgReceiptVisible &&
        lastMessage?.messageRefer.senderId ===
          store.userStore.myUserInfo.accountId &&
        lastMessage?.messageType !==
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
        lastMessage?.messageType !==
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION &&
        lastMessage?.sendingState ===
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED &&
        lastMessage?.lastMessageState !==
          V2NIMConst.V2NIMLastMessageState.V2NIM_MESSAGE_STATUS_REVOKE ? (
        <div className={`${prefix}-item-content-read-status`}>
          {(msgReceiptTime ?? 0) -
            (lastMessage?.messageRefer.createTime ?? 0) >=
          0 ? (
            <ReadPercent size={14} unread={0} read={1} prefix={commonPrefix} />
          ) : (
            <ReadPercent size={14} unread={1} read={0} prefix={commonPrefix} />
          )}
        </div>
      ) : null
    }

    return (
      <ConversationItem
        isTop={stickTop}
        isMute={mute}
        conversationName={store.uiStore.getAppellation({ account: to })}
        time={lastMessage?.messageRefer.createTime || updateTime}
        lastMessage={lastMessage}
        isSelected={isSelected}
        onItemClick={onItemClick}
        menuRenderer={menuRenderer}
        prefix={prefix}
        commonPrefix={commonPrefix}
        conversationMsgRenderer={conversationMsgRenderer}
        conversationNameRenderer={conversationNameRenderer}
        renderConversationMsgIsRead={renderSessionMsgIsRead}
        conversationId={conversationId}
        avatarRenderer={
          avatarRenderer ?? (
            <ComplexAvatarContainer
              account={to}
              prefix={commonPrefix}
              canClick={false}
              count={isSelected ? 0 : unreadCount}
              dot={isSelected ? false : mute && unreadCount > 0}
            />
          )
        }
      />
    )
  }
)
