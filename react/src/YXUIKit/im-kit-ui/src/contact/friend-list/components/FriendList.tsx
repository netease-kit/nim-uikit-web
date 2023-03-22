import React, { FC, useMemo } from 'react'
import { Utils, useTranslation } from '../../../common'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { FriendItem } from './FriendItem'
import { Spin, Empty } from 'antd'

export interface FriendListProps {
  list: NimKitCoreTypes.IFriendInfo[]
  loading?: boolean
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  renderFriendListHeader?: () => JSX.Element
  renderFriendListEmpty?: () => JSX.Element
  prefix?: string
  commonPrefix?: string
}

export const FriendList: FC<FriendListProps> = ({
  list,
  loading = false,
  onItemClick,
  afterSendMsgClick,
  renderFriendListHeader,
  renderFriendListEmpty,
  prefix = 'contact',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-friend`

  const { t } = useTranslation()

  const dataSource = useMemo(() => {
    return Utils.groupByPy<NimKitCoreTypes.IFriendInfo>(
      list,
      {
        firstKey: 'alias',
        secondKey: 'nick',
        thirdKey: 'account',
      },
      false
    )
  }, [list])

  return (
    <div className={`${_prefix}-wrapper`}>
      <div className={`${_prefix}-title`}>
        {renderFriendListHeader
          ? renderFriendListHeader()
          : t('friendListTitle')}
      </div>
      {loading ? (
        <Spin />
      ) : !list.length ? (
        renderFriendListEmpty ? (
          renderFriendListEmpty()
        ) : (
          <Empty style={{ marginTop: 10 }} />
        )
      ) : (
        dataSource.map(({ key, data }) => {
          return (
            <div className={`${_prefix}-subtitle`} key={key}>
              <div className={`${_prefix}-subtitle-item`}>{key}</div>
              {data.map((item) => (
                <FriendItem
                  key={`${key}_${item.account}`}
                  onItemClick={onItemClick}
                  afterSendMsgClick={afterSendMsgClick}
                  prefix={prefix}
                  commonPrefix={commonPrefix}
                  {...item}
                />
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}
