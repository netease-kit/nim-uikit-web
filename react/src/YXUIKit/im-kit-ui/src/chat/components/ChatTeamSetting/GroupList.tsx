import React, { FC, useEffect, useState } from 'react'
import { GroupItem, GroupItemProps } from './GroupItem'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useTranslation } from '../../../common'

export interface GroupListProps {
  myAccount: string
  members: (TeamMember & Partial<FriendProfile>)[]
  hasPower: boolean
  onRemoveTeamMemberClick: (member: TeamMember) => void
  afterSendMsgClick?: () => void
  renderTeamMemberItem?: (
    params: GroupItemProps
  ) => JSX.Element | null | undefined
  onTeamMemberSearchChange: (searchText: string) => void
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
  onTeamMemberSearchChange,
  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-group-list`
  const { t } = useTranslation()

  const handleSearch = (searchText: string) => {
    onTeamMemberSearchChange(searchText)
  }
  return (
    <div className={`${_prefix}-wrap`}>
      <Input
        prefix={<SearchOutlined style={{ color: '#b3b7bc' }} />}
        allowClear
        className={`${_prefix}-input`}
        placeholder={t('searchTeamMemberPlaceholder')}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {members.length ? (
        members.map((item) => {
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
        })
      ) : (
        <div className={`${_prefix}-no-result`}>{t('searchNoResText')}</div>
      )}
    </div>
  )
}

export default GroupList
