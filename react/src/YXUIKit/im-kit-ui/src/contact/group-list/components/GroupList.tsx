import React, { FC } from 'react'
import { GroupItem } from './GroupItem'
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService'
import { useTranslation } from '../../../common'
import { Spin, Empty } from 'antd'

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
          list.map((item) => (
            <GroupItem
              key={item.teamId}
              prefix={prefix}
              onItemClick={onItemClick}
              {...item}
            />
          ))
        )}
      </div>
    </div>
  )
}
