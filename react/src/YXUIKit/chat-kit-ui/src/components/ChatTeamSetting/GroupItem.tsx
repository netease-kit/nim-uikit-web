import React, { FC, useState } from 'react'
import { Modal } from 'antd'
import classnames from 'classnames'
import { ComplexAvatarContainer, useTranslation } from '../../../../common-ui/src'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'

export interface GroupItemProps {
  member: TeamMember & Partial<FriendProfile>
  onRemoveTeamMemberClick: (member: TeamMember) => void
  afterSendMsgClick?: () => void
  hasPower: boolean
  isSelf: boolean

  prefix?: string
  commonPrefix?: string
}

const { confirm } = Modal

export const GroupItem: FC<GroupItemProps> = ({
  member,
  onRemoveTeamMemberClick,
  afterSendMsgClick,
  hasPower,
  isSelf,

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-group-item`

  const { t } = useTranslation()

  const [isActive, setIsActive] = useState(false)

  return (
    <div
      className={classnames(
        `${_prefix}-wrap`,
        `${isActive ? `${_prefix}-active` : ''}`
      )}
      onMouseOver={() => {
        setIsActive(true)
      }}
      onMouseLeave={() => setIsActive(false)}
    >
      <div className={`${_prefix}-avatar-box`}>
        <ComplexAvatarContainer
          prefix={commonPrefix}
          afterSendMsgClick={afterSendMsgClick}
          canClick={!isSelf}
          account={member.account}
        />
        <span className={`${_prefix}-label`}>
          {member.nickInTeam || member.alias || member.account}
        </span>
      </div>
      {isActive && hasPower && !isSelf ? (
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
                onRemoveTeamMemberClick(member)
              },
            })
          }}
        >
          {t('removeTeamMemberText')}
        </a>
      ) : member.type === 'owner' ? (
        <span className={`${_prefix}-owner`}>{t('teamOwnerText')}</span>
      ) : member.type === 'manager' ? (
        <span className={`${_prefix}-owner`}>{t('teamManagerText')}</span>
      ) : null}
    </div>
  )
}
