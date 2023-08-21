import React, { FC, useState } from 'react'
import { Modal } from 'antd'
import classnames from 'classnames'
import {
  ComplexAvatarContainer,
  useTranslation,
  useStateContext,
} from '../../../common'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { observer } from 'mobx-react'

export interface GroupItemProps {
  myMemberInfo: TeamMember
  member: TeamMember
  onRemoveTeamMemberClick: (member: TeamMember) => void
  afterSendMsgClick?: () => void

  prefix?: string
  commonPrefix?: string
}

const { confirm } = Modal

export const GroupItem: FC<GroupItemProps> = observer(
  ({
    myMemberInfo,
    member,
    onRemoveTeamMemberClick,
    afterSendMsgClick,

    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const _prefix = `${prefix}-group-item`

    const { t } = useTranslation()

    const { store } = useStateContext()

    const [isActive, setIsActive] = useState(false)

    const isSelf = member.account === myMemberInfo.account

    const renderRemoveBtn = () => {
      return (
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
      )
    }

    const renderButton = () => {
      if (member.type === 'owner') {
        return <span className={`${_prefix}-owner`}>{t('teamOwnerText')}</span>
      }

      if (member.type === 'manager') {
        return myMemberInfo.type === 'owner' && isActive ? (
          renderRemoveBtn()
        ) : (
          <span className={`${_prefix}-manager`}>{t('teamManagerText')}</span>
        )
      }

      if (member.type === 'normal') {
        return (myMemberInfo.type === 'owner' ||
          myMemberInfo.type === 'manager') &&
          isActive &&
          !isSelf
          ? renderRemoveBtn()
          : null
      }

      return null
    }

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
            {store.uiStore.getAppellation({
              account: member.account,
              teamId: member.teamId,
            })}
          </span>
        </div>

        {renderButton()}
      </div>
    )
  }
)
