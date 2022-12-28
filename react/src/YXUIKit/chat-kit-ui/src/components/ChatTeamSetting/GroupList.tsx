import React, { FC } from 'react'
import { GroupItem } from './GroupItem'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'

interface GroupListProps {
  myAccount: string
  members: (TeamMember & Partial<FriendProfile>)[]
  hasPower: boolean
  onRemoveTeamMemberClick: (member: TeamMember) => void
  afterSendMsgClick?: () => void
  renderTeamMemberItem?: (params: {
    member: TeamMember & Partial<FriendProfile>
  }) => JSX.Element | null | undefined

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
      {members.map(
        (item) =>
          renderTeamMemberItem?.({ member: item }) ?? (
            <GroupItem
              key={item.account}
              member={item}
              hasPower={hasPower}
              isSelf={item.account === myAccount}
              prefix={prefix}
              commonPrefix={commonPrefix}
              onRemoveTeamMemberClick={onRemoveTeamMemberClick}
              afterSendMsgClick={afterSendMsgClick}
            />
          )
      )}
    </div>
  )
}

export default GroupList
