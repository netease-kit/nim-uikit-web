import React, { FC, useCallback } from 'react'
import { GroupItem } from './GroupItem'
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import { useTranslation } from '../../../common'
import { Spin, Empty } from 'antd'
import { AutoSizer, List } from 'react-virtualized'

export interface GroupListProps {
  list: V2NIMTeam[]
  loading?: boolean
  onItemClick?: (team: V2NIMTeam) => void
  renderGroupListHeader?: () => JSX.Element
  renderGroupListEmpty?: () => JSX.Element
  prefix?: string
}

export const GroupList: FC<GroupListProps> = ({
  list,
  loading = false,
  onItemClick,
  renderGroupListHeader,
  renderGroupListEmpty,
  prefix = 'contact',
}) => {
  const _prefix = `${prefix}-group`

  const { t } = useTranslation()

  const rowRenderer = useCallback(
    ({ index, key, style }) => {
      const item = list[index]

      return (
        <div style={style} key={key}>
          <GroupItem
            key={item.teamId}
            prefix={prefix}
            onItemClick={onItemClick}
            {...item}
          />
        </div>
      )
    },
    [list, onItemClick, prefix]
  )

  return (
    <div className={`${_prefix}-wrapper`}>
      <div className={`${_prefix}-title`}>
        {renderGroupListHeader ? renderGroupListHeader() : t('teamListTitle')}
      </div>
      <div className={`${_prefix}-content`}>
        {loading ? (
          <Spin />
        ) : !list.length ? (
          renderGroupListEmpty ? (
            renderGroupListEmpty()
          ) : (
            <Empty style={{ marginTop: 10 }} />
          )
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                overscanRowCount={10}
                rowCount={list.length}
                rowHeight={70}
                rowRenderer={rowRenderer}
                width={width}
              />
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  )
}
