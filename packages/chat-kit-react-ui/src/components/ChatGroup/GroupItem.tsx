import React, { FC, useState, useMemo } from 'react'
import { Modal } from 'antd'
import classnames from 'classnames'
import {
  CrudeAvatar,
  ComplexAvatarContainer,
  useTranslation,
} from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import { ITeamInfo } from '../../types'
import { MIN_VALUE } from '../../constant'

export interface GroupItemProps extends NimKitCoreTypes.ITeamMemberInfo {
  prefix?: string
  commonPrefix?: string
  index: number
  list: NimKitCoreTypes.ITeamMemberInfo[]
  teamInfo: ITeamInfo
  onItemClick?: (teamId: string) => void
  initOptions: NIMInitializeOptions
  onRemoveTeamMemberClick: (memberInfo: NimKitCoreTypes.ITeamMemberInfo) => void
  afterSendMsgClick?: () => void
  isGroupOwner: boolean
  isGroupManager: boolean
}

const { confirm } = Modal

export const GroupItem: FC<GroupItemProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  index,
  list,
  onItemClick,
  initOptions,
  onRemoveTeamMemberClick,
  afterSendMsgClick,
  teamInfo,
  isGroupOwner,
  isGroupManager,
  ...props
}) => {
  const _prefix = `${prefix}-group-item`

  const { t } = useTranslation()

  const [curGroupItemIndex, setCurGroupItemIndex] = useState<number>(MIN_VALUE)
  const isActive = useMemo(() => {
    return curGroupItemIndex === index
  }, [curGroupItemIndex, index])

  return (
    <div
      className={classnames(
        `${_prefix}-wrap`,
        `${isActive ? `${_prefix}-active` : ''}`
      )}
      onMouseOver={(e) => {
        if (index === 0) return
        e.stopPropagation()
        setCurGroupItemIndex(list.findIndex((item) => item.id === props.id))
      }}
      onMouseLeave={() => setCurGroupItemIndex(MIN_VALUE)}
      onClick={() => onItemClick?.(props.teamId)}
    >
      <div className={`${_prefix}-avatar-box`}>
        {props.account === initOptions.account ? (
          <CrudeAvatar
            size={36}
            avatar={props.avatar}
            nick={props.nickInTeam || props.nick || ''}
            account={''}
          />
        ) : (
          <ComplexAvatarContainer
            prefix={commonPrefix}
            size={36}
            afterSendMsgClick={afterSendMsgClick}
            {...props}
          />
        )}
        <span className={`${_prefix}-label`}>
          {props.nickInTeam || props.nick || props.teamId || ''}
        </span>
        {props.type === 'owner' && (
          <span className={`${_prefix}-owner`}>{t('teamOwnerText')}</span>
        )}
        {props.type === 'manager' && (
          <span className={`${_prefix}-owner`}>{t('teamManagerText')}</span>
        )}
      </div>
      {isActive && (isGroupOwner || isGroupManager) && (
        <a
          type="link"
          className={`${_prefix}-remove-member`}
          onClick={() => {
            confirm({
              content: t('removeTeamMemberConfirmText'),
              okText: t('okText'),
              cancelText: t('cancelText'),
              okType: 'danger',
              onOk() {
                onRemoveTeamMemberClick(list[index])
              },
            })
          }}
        >
          {t('removeTeamMemberText')}
        </a>
      )}
    </div>
  )
}
