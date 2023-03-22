import React, { FC, useMemo } from 'react'
import { Menu } from 'antd'
import { CrudeAvatar, CommonIcon, useTranslation } from '../../common'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { ConversationItem } from './ConversationItem'

export interface P2PItemProps extends NimKitCoreTypes.P2PSession {
  isSelected: boolean
  onStickTopChange: (isTop: boolean) => void
  onDeleteClick: () => void
  onMuteChange: (mute: boolean) => void
  onItemClick: () => void
  avatarRenderer?: JSX.Element | null
  sessionNameRenderer?: JSX.Element | null
  sessionMsgRenderer?: JSX.Element | null

  prefix?: string
  commonPrefix?: string
}

export const P2PItem: FC<P2PItemProps> = ({
  onStickTopChange,
  onDeleteClick,
  onMuteChange,
  onItemClick,
  isMute,
  stickTopInfo,
  nick,
  alias,
  account,
  unread,
  lastMsg,
  updateTime,
  isSelected,
  avatarRenderer,
  sessionMsgRenderer,
  sessionNameRenderer,
  prefix = 'conversation',
  commonPrefix = 'common',
  ...props
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
            case 'stickTop':
              onStickTopChange(!stickTopInfo?.isStickOnTop)
              break
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
  }, [
    isMute,
    stickTopInfo?.isStickOnTop,
    onStickTopChange,
    onDeleteClick,
    onMuteChange,
    t,
  ])

  return (
    <ConversationItem
      isTop={!!stickTopInfo?.isStickOnTop}
      isMute={isMute}
      sessionName={alias || nick || account}
      time={lastMsg?.time || updateTime}
      lastMsg={lastMsg}
      isSelected={isSelected}
      onItemClick={onItemClick}
      menuRenderer={menuRenderer}
      prefix={prefix}
      commonPrefix={commonPrefix}
      sessionMsgRenderer={sessionMsgRenderer}
      sessionNameRenderer={sessionNameRenderer}
      avatarRenderer={
        avatarRenderer ?? (
          <CrudeAvatar
            nick={nick}
            account={account}
            alias={alias}
            avatar={props.avatar}
            count={isSelected ? 0 : unread}
            dot={isSelected ? false : isMute && unread > 0}
          />
        )
      }
    />
  )
}
