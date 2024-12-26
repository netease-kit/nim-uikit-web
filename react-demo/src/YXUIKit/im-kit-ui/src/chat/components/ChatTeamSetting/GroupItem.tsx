import React, { FC, useState } from 'react'
import { Modal } from 'antd'
import classnames from 'classnames'
import {
  ComplexAvatarContainer,
  useTranslation,
  useStateContext,
} from '../../../common'
import { V2NIMTeamMember } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import { observer } from 'mobx-react'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

export interface GroupItemProps {
  myMemberInfo: V2NIMTeamMember
  member: V2NIMTeamMember
  onRemoveTeamMemberClick: (member: V2NIMTeamMember) => void
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

    const isSelf = member.accountId === myMemberInfo.accountId

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
      if (
        member.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
      ) {
        return <span className={`${_prefix}-owner`}>{t('teamOwnerText')}</span>
      }

      if (
        member.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
      ) {
        return myMemberInfo.memberRole ===
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER &&
          isActive ? (
          renderRemoveBtn()
        ) : (
          <span className={`${_prefix}-manager`}>{t('teamManagerText')}</span>
        )
      }

      if (
        member.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL
      ) {
        return (myMemberInfo.memberRole ===
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER ||
          myMemberInfo.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER) &&
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
            account={member.accountId}
          />
          <span className={`${_prefix}-label`}>
            {store.uiStore.getAppellation({
              account: member.accountId,
              teamId: member.teamId,
            })}
          </span>
        </div>

        {renderButton()}
      </div>
    )
  }
)
