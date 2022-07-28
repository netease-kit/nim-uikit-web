import React, { FC, useMemo } from 'react'
import { Menu } from 'antd'
import { CrudeAvatar, CommonIcon, useTranslation } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { ConversationItem } from './ConversationItem'

export interface P2PItemProps extends NimKitCoreTypes.P2PSession {
  isSelected: boolean
  onDeleteClick: () => void
  onMuteChange: (mute: boolean) => void
  onItemClick: () => void

  prefix?: string
  commonPrefix?: string
}

export const P2PItem: FC<P2PItemProps> = ({
  onDeleteClick,
  onMuteChange,
  onItemClick,
  isMute,
  nick,
  account,
  unread,
  lastMsg,
  updateTime,
  isSelected,
  prefix = 'conversation',
  commonPrefix = 'common',
  ...props
}) => {
  const { t } = useTranslation()

  const menuRenderer = useMemo(() => {
    const items = [
      {
        label: isMute ? t('unmuteSessionText') : t('muteSessionText'),
        icon: isMute ? (
          <CommonIcon type="icon-quxiaoxiaoximiandarao" />
        ) : (
          <CommonIcon type="icon-xiaoximiandarao" />
        ),
        key: 'muteSession',
      },
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
            case 'muteSession':
              onMuteChange(!isMute)
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
  }, [isMute, onDeleteClick, onMuteChange, t])

  return (
    <ConversationItem
      isMute={isMute}
      sessionName={nick || account}
      time={lastMsg?.time || updateTime}
      lastMsg={lastMsg}
      isSelected={isSelected}
      onItemClick={onItemClick}
      menuRenderer={menuRenderer}
      prefix={prefix}
      commonPrefix={commonPrefix}
      avatarRenderer={
        <CrudeAvatar
          nick={nick}
          account={account}
          avatar={props.avatar}
          count={isSelected ? 0 : unread}
          dot={isSelected ? false : isMute && unread > 0}
        />
      }
    />
  )
}
