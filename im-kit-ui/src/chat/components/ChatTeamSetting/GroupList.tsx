import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { GroupItem, GroupItemProps } from './GroupItem'
import { V2NIMTeamMember } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useStateContext, useTranslation } from '../../../common'
import { observer } from 'mobx-react'
import { AutoSizer, List } from 'react-virtualized'

export interface GroupListProps {
  myMemberInfo: V2NIMTeamMember
  members: V2NIMTeamMember[]
  onRemoveTeamMemberClick: (member: V2NIMTeamMember) => void
  afterSendMsgClick?: () => void
  renderTeamMemberItem?: (
    params: GroupItemProps & {
      renderKey: string
      renderIndex: number
      renderStyle: React.CSSProperties
    }
  ) => JSX.Element | null | undefined
  prefix?: string
  commonPrefix?: string
}

const GroupList: FC<GroupListProps> = observer(
  ({
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

    useEffect(() => {
      members
        .filter(
          (item) =>
            !store.userStore.users.has(item.accountId) &&
            !store.aiUserStore.aiUsers.has(item.accountId)
        )
        .forEach((item) => {
          store.userStore.getUserActive(item.accountId)
        })
    }, [members, store.userStore, store.aiUserStore])

    const showMembers = useMemo(() => {
      let _sortedMembers = members

      if (groupSearchText) {
        _sortedMembers = members.filter((item) =>
          store.uiStore
            .getAppellation({ account: item.accountId, teamId: item.teamId })
            .includes(groupSearchText)
        )
      }

      return _sortedMembers
    }, [members, groupSearchText, store.uiStore])

    const rowRenderer = useCallback(
      ({ index, style }) => {
        const item = showMembers[index]
        const key = item.accountId
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
              <GroupItem key={item.accountId} {...itemProps} />
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
)

export default GroupList
