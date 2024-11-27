import React, { FC, useMemo } from 'react'
import { Menu } from 'antd'
import {
  CrudeAvatar,
  CommonIcon,
  useTranslation,
  useStateContext,
} from '../../common'
import { ConversationItem } from './ConversationItem'
import { V2NIMConversationForUI } from '@xkit-yx/im-store-v2/dist/types/types'

export interface GroupItemProps extends V2NIMConversationForUI {
  isSelected: boolean
  onStickTopChange: (isTop: boolean) => void
  onDeleteClick: () => void
  onItemClick: () => void
  avatarRenderer?: JSX.Element | null
  conversationNameRenderer?: JSX.Element | null
  conversationMsgRenderer?: JSX.Element | null
  prefix?: string
  commonPrefix?: string
}

export const GroupItem: FC<GroupItemProps> = ({
  onStickTopChange,
  onDeleteClick,
  conversationId,
  name,
  avatar,
  unreadCount,
  lastMessage,
  beMentioned,
  stickTop,
  updateTime,
  isSelected,
  onItemClick,
  avatarRenderer,
  conversationNameRenderer,
  conversationMsgRenderer,
  prefix = 'conversation',
  commonPrefix = 'common',
}) => {
  const { nim } = useStateContext()
  const { t } = useTranslation()

  const teamId =
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
      // {
      //   label: ext === '0' ? t('unmuteSessionText') : t('muteSessionText'),
      //   icon: isMute ? (
      //     <CommonIcon type="icon-quxiaoxiaoximiandarao" />
      //   ) : (
      //     <CommonIcon type="icon-xiaoximiandarao" />
      //   ),
      //   key: 'muteSession',
      // },
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
  }, [stickTop, onStickTopChange, onDeleteClick, t])

  return (
    <ConversationItem
      isTop={stickTop}
      isMute={false}
      conversationName={name || teamId}
      time={lastMessage?.messageRefer.createTime || updateTime}
      lastMessage={lastMessage}
      beMentioned={beMentioned}
      isSelected={isSelected}
      onItemClick={onItemClick}
      prefix={prefix}
      commonPrefix={commonPrefix}
      menuRenderer={menuRenderer}
      conversationMsgRenderer={conversationMsgRenderer}
      conversationNameRenderer={conversationNameRenderer}
      avatarRenderer={
        avatarRenderer ?? (
          <CrudeAvatar
            nick={name}
            account={teamId}
            avatar={avatar}
            count={isSelected ? 0 : unreadCount}
          />
        )
      }
    />
  )
}
