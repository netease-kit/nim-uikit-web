import React, { FC, useCallback, useMemo, useState } from 'react'
import { GroupItem, GroupItemProps } from './GroupItem'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useStateContext, useTranslation } from '../../../common'
import { AutoSizer, List } from 'react-virtualized'

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

  const rowRenderer = useCallback(
    ({ index, key, style }) => {
      const item = showMembers[index]
      const itemProps: GroupItemProps & {
        renderKey: string
        renderIndex: number
        renderStyle: React.CSSProperties
      } = {
        member: item,
        onRemoveTeamMemberClick,
        afterSendMsgClick,
        myMemberInfo,
        prefix,
        commonPrefix,
        renderIndex: index,
        renderKey: key,
        renderStyle: style,
      }

      return (
        renderTeamMemberItem?.(itemProps) ?? (
          <div key={key} style={style}>
            <GroupItem key={item.account} {...itemProps} />
          </div>
        )
      )
    },
    [
      afterSendMsgClick,
      commonPrefix,
      myMemberInfo,
      onRemoveTeamMemberClick,
      prefix,
      renderTeamMemberItem,
      showMembers,
    ]
  )

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
      <div className={`${_prefix}-list`}>
        {showMembers.length ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                overscanRowCount={10}
                rowCount={showMembers.length}
                rowHeight={60}
                rowRenderer={rowRenderer}
                width={width}
              />
            )}
          </AutoSizer>
        ) : (
          <div className={`${_prefix}-no-result`}>{t('searchNoResText')}</div>
        )}
      </div>
    </div>
  )
}

export default GroupList
