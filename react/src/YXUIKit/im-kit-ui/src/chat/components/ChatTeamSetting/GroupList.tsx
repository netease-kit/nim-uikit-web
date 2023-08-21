import React, { FC, useMemo, useState } from 'react'
import { GroupItem, GroupItemProps } from './GroupItem'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useStateContext, useTranslation } from '../../../common'

export interface GroupListProps {
  myMemberInfo: TeamMember
  members: TeamMember[]
  onRemoveTeamMemberClick: (member: TeamMember) => void
  afterSendMsgClick?: () => void
  renderTeamMemberItem?: (
    params: GroupItemProps
  ) => JSX.Element | null | undefined
  prefix?: string
  commonPrefix?: string
}

const GroupList: FC<GroupListProps> = ({
  myMemberInfo,
  members,
  onRemoveTeamMemberClick,
  afterSendMsgClick,
  renderTeamMemberItem,
  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-group-list`
  const { t } = useTranslation()
  const { store } = useStateContext()
  const [groupSearchText, setGroupSearchText] = useState<string>('')
  const handleSearch = (searchText: string) => {
    setGroupSearchText(searchText)
  }

  const showMembers = useMemo(() => {
    let _sortedMembers = members
    if (groupSearchText) {
      _sortedMembers = members.filter((item) =>
        store.uiStore
          .getAppellation({ account: item.account, teamId: item.teamId })
          .includes(groupSearchText)
      )
    }
    return _sortedMembers
  }, [members, groupSearchText])

  return (
    <div className={`${_prefix}-wrap`}>
      <Input
        prefix={<SearchOutlined style={{ color: '#b3b7bc' }} />}
        allowClear
        className={`${_prefix}-input`}
        value={groupSearchText}
        placeholder={t('searchTeamMemberPlaceholder')}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {showMembers.length ? (
        showMembers.map((item) => {
          const itemProps = {
            member: item,
            onRemoveTeamMemberClick,
            afterSendMsgClick,
            myMemberInfo,
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
