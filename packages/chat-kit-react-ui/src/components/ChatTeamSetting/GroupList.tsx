import React, { FC } from 'react'
import { GroupItem } from './GroupItem'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

interface GroupListProps {
  myAccount: string
  members: TeamMember[]
  hasPower: boolean
  onRemoveTeamMemberClick: (member: TeamMember) => void
  afterSendMsgClick?: () => void

  prefix?: string
  commonPrefix?: string
}

const GroupList: FC<GroupListProps> = ({
  myAccount,
  members,
  hasPower,
  onRemoveTeamMemberClick,
  afterSendMsgClick,

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-group-list`

  return (
    <div className={`${_prefix}-wrap`}>
      {members.map((item) => (
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
      ))}
    </div>
  )
}

export default GroupList
