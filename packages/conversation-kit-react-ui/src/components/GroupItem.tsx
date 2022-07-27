import React, { FC, useMemo } from 'react'
import { Menu } from 'antd'
import { CrudeAvatar, CommonIcon, useTranslation } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { ConversationItem } from './ConversationItem'

export interface GroupItemProps extends NimKitCoreTypes.TeamSession {
  isSelected: boolean
  onDeleteClick: () => void
  onItemClick: () => void
  prefix?: string
  commonPrefix?: string
}

export const GroupItem: FC<GroupItemProps> = ({
  onDeleteClick,
  teamId,
  name,
  avatar,
  unread,
  lastMsg,
  updateTime,
  isSelected,
  onItemClick,
  prefix = 'conversation',
  commonPrefix = 'common',
}) => {
  const { t } = useTranslation()

  const menuRenderer = useMemo(() => {
    const items = [
      {
        label: t('deleteSessionText'),
        icon: <CommonIcon type="icon-shanchu" />,
        key: 'deleteSession',
      },
    ] as any

    return (
      <Menu
        onClick={({ key, domEvent }) => {
          domEvent.stopPropagation()
          switch (key) {
            case 'deleteSession':
              onDeleteClick()
              break
            default:
              break
          }
        }}
        items={items}
      ></Menu>
    )
  }, [onDeleteClick, t])

  return (
    <ConversationItem
      isMute={false}
      sessionName={name || teamId}
      time={lastMsg?.time || updateTime}
      lastMsg={lastMsg}
      isSelected={isSelected}
      onItemClick={onItemClick}
      prefix={prefix}
      commonPrefix={commonPrefix}
      menuRenderer={menuRenderer}
      avatarRenderer={
        <CrudeAvatar
          nick={name}
          account={teamId}
          avatar={avatar}
          count={isSelected ? 0 : unread}
        />
      }
    />
  )
}
