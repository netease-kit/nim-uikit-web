import React, { FC } from 'react'
import { CrudeAvatar } from '../../../common'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

export interface GroupItemProps extends Team {
  onItemClick?: (team: Team) => void
  prefix?: string
}

export const GroupItem: FC<GroupItemProps> = ({
  name,
  teamId,
  avatar,
  onItemClick,
  prefix = 'contact',
  ...props
}) => {
  const _prefix = `${prefix}-group-item`
  return (
    <div
      className={_prefix}
      onClick={(e) => {
        e.stopPropagation()
        onItemClick?.({
          ...props,
          name,
          teamId,
          avatar,
        })
      }}
    >
      <CrudeAvatar size={36} account={teamId} nick={name} avatar={avatar} />
      <span className={`${_prefix}-label`}>{name || teamId || ''}</span>
    </div>
  )
}
