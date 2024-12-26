import React, { FC, useMemo } from 'react'
import { Menu } from 'antd'
import { CrudeAvatar, CommonIcon, useTranslation } from '../../common'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { ConversationItem } from './ConversationItem'

export interface GroupItemProps extends NimKitCoreTypes.TeamSession {
  isSelected: boolean
  onStickTopChange: (isTop: boolean) => void
  onDeleteClick: () => void
  onItemClick: () => void
  beMentioned?: boolean
  aitMsgs?: string[]
  id: string
  avatarRenderer?: JSX.Element | null
  sessionNameRenderer?: JSX.Element | null
  sessionMsgRenderer?: JSX.Element | null
  prefix?: string
  commonPrefix?: string
}

export const GroupItem: FC<GroupItemProps> = ({
  onStickTopChange,
  onDeleteClick,
  teamId,
  name,
  id,
  avatar,
  unread,
  lastMsg,
  beMentioned,
  aitMsgs,
  stickTopInfo,
  updateTime,
  isSelected,
  onItemClick,
  avatarRenderer,
  sessionNameRenderer,
  sessionMsgRenderer,
  prefix = 'conversation',
  commonPrefix = 'common',
}) => {
  const { t } = useTranslation()

  const menuRenderer = useMemo(() => {
    const items = [
      {
        label: stickTopInfo?.isStickOnTop
          ? t('deleteStickTopText')
          : t('addStickTopText'),
        icon: stickTopInfo?.isStickOnTop ? (
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
        key: 'deleteSession',
      },
    ] as any

    return (
      <Menu
        onClick={({ key, domEvent }) => {
          domEvent.stopPropagation()
          switch (key) {
            case 'stickTop':
              onStickTopChange(!stickTopInfo?.isStickOnTop)
              break
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
  }, [stickTopInfo?.isStickOnTop, onStickTopChange, onDeleteClick, t])

  return (
    <ConversationItem
      isTop={!!stickTopInfo?.isStickOnTop}
      isMute={false}
      id={id}
      sessionName={name || teamId}
      time={lastMsg?.time || updateTime}
      lastMsg={lastMsg}
      beMentioned={beMentioned}
      isSelected={isSelected}
      onItemClick={onItemClick}
      prefix={prefix}
      commonPrefix={commonPrefix}
      menuRenderer={menuRenderer}
      sessionMsgRenderer={sessionMsgRenderer}
      sessionNameRenderer={sessionNameRenderer}
      aitMsgs={aitMsgs}
      avatarRenderer={
        avatarRenderer ?? (
          <CrudeAvatar
            nick={name}
            account={teamId}
            avatar={avatar}
            count={isSelected ? 0 : unread}
          />
        )
      }
    />
  )
}
