import React, { FC } from 'react'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import { ITeamInfo } from '../../types'
import { GroupItem } from './GroupItem'

interface GroupListProps {
  prefix?: string
  commonPrefix?: string
  list: NimKitCoreTypes.ITeamMemberInfo[]
  teamInfo: ITeamInfo
  onItemClick?: (account: string) => void
  initOptions: NIMInitializeOptions
  onRemoveTeamMemberClick: (memberInfo: NimKitCoreTypes.ITeamMemberInfo) => void
  afterSendMsgClick?: () => void
  isGroupOwner: boolean
  isGroupManager: boolean
}

const GroupList: FC<GroupListProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  list,
  onItemClick,
  initOptions,
  onRemoveTeamMemberClick,
  afterSendMsgClick,
  teamInfo,
  isGroupOwner,
  isGroupManager,
}) => {
  const _prefix = `${prefix}-group-list`

  return (
    <div className={`${_prefix}-wrap`}>
      {list.map((item, index) => (
        <GroupItem
          prefix={prefix}
          commonPrefix={commonPrefix}
          key={item.account}
          teamInfo={teamInfo}
          index={index}
          onItemClick={onItemClick}
          initOptions={initOptions}
          onRemoveTeamMemberClick={onRemoveTeamMemberClick}
          afterSendMsgClick={afterSendMsgClick}
          list={list}
          isGroupOwner={isGroupOwner}
          isGroupManager={isGroupManager}
          {...item}
        />
      ))}
    </div>
  )
}

export default GroupList
