import React, { FC, useMemo } from 'react'
import { Menu } from 'antd'
import {
  ComplexAvatarContainer,
  CommonIcon,
  useTranslation,
  useStateContext,
  ReadPercent,
} from '../../common'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { ConversationItem } from './ConversationItem'
import { CheckCircleOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'

export interface P2PItemProps extends NimKitCoreTypes.P2PSession {
  isSelected: boolean
  id: string
  onStickTopChange: (isTop: boolean) => void
  onDeleteClick: () => void
  onMuteChange: (mute: boolean) => void
  onItemClick: () => void
  avatarRenderer?: JSX.Element | null
  sessionNameRenderer?: JSX.Element | null
  sessionMsgRenderer?: JSX.Element | null
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
    isMute,
    stickTopInfo,
    to,
    id,
    unread,
    lastMsg,
    updateTime,
    isSelected,
    avatarRenderer,
    sessionMsgRenderer,
    sessionNameRenderer,
    prefix = 'conversation',
    commonPrefix = 'common',
    msgReceiptTime,
    ...props
  }) => {
    const { t } = useTranslation()
    const { store, localOptions } = useStateContext()

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

    const renderSessionMsgIsRead = () => {
      return localOptions.p2pMsgReceiptVisible &&
        lastMsg?.flow === 'out' &&
        lastMsg?.type !== 'g2' &&
        lastMsg?.type !== 'notification' ? (
        <div className={`${prefix}-item-content-read-status`}>
          {(msgReceiptTime ?? 0) - (lastMsg?.time ?? 0) >= 0 ? (
            <CheckCircleOutlined
              className={`${prefix}-item-content-read-icon`}
            />
          ) : (
            <ReadPercent radius={7} unread={1} read={0} prefix={commonPrefix} />
          )}
        </div>
      ) : null
    }

    return (
      <ConversationItem
        isTop={!!stickTopInfo?.isStickOnTop}
        isMute={isMute}
        id={id}
        sessionName={store.uiStore.getAppellation({ account: to })}
        time={lastMsg?.time || updateTime}
        lastMsg={lastMsg}
        isSelected={isSelected}
        onItemClick={onItemClick}
        menuRenderer={menuRenderer}
        prefix={prefix}
        commonPrefix={commonPrefix}
        sessionMsgRenderer={sessionMsgRenderer}
        sessionNameRenderer={sessionNameRenderer}
        renderSessionMsgIsRead={renderSessionMsgIsRead}
        avatarRenderer={
          avatarRenderer ?? (
            <ComplexAvatarContainer
              account={to}
              prefix={commonPrefix}
              canClick={false}
              count={isSelected ? 0 : unread}
              dot={isSelected ? false : isMute && unread > 0}
            />
          )
        }
      />
    )
  }
)
