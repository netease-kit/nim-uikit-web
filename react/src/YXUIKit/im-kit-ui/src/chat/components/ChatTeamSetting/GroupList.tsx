import React, { FC } from 'react'
import { GroupItem, GroupItemProps } from './GroupItem'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'

export interface GroupListProps {
  myAccount: string
  members: (TeamMember & Partial<FriendProfile>)[]
  hasPower: boolean
  onRemoveTeamMemberClick: (member: TeamMember) => void
  afterSendMsgClick?: () => void
  renderTeamMemberItem?: (
    params: GroupItemProps
  ) => JSX.Element | null | undefined

  prefix?: string
  commonPrefix?: string
}

const GroupList: FC<GroupListProps> = ({
  myAccount,
  members,
  hasPower,
  onRemoveTeamMemberClick,
  afterSendMsgClick,
  renderTeamMemberItem,

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-group-list`

  return (
    <div className={`${_prefix}-wrap`}>
      {members.map((item) => {
        const itemProps = {
          member: item,
          onRemoveTeamMemberClick,
          afterSendMsgClick,
          hasPower,
          isSelf: item.account === myAccount,
          prefix,
          commonPrefix,
        }
        return (
          renderTeamMemberItem?.(itemProps) ?? (
            <GroupItem key={item.account} {...itemProps} />
          )
        )
      })}
    </div>
  )
}

export default GroupList
