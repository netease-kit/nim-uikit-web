import React, { FC } from 'react'
import { GroupItem } from './GroupItem'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { useTranslation } from '@xkit-yx/common-ui'
import { Spin, Empty } from 'antd'

export interface GroupListProps {
  list: Team[]
  loading?: boolean
  onItemClick?: (team: Team) => void
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
