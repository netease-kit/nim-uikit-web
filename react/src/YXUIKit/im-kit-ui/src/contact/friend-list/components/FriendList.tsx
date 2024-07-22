import React, { FC, useCallback, useMemo } from 'react'
import { Utils, useTranslation } from '../../../common'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { FriendItem } from './FriendItem'
import { Spin, Empty } from 'antd'
import { AutoSizer, List } from 'react-virtualized'

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
    const group = Utils.groupByPy<NimKitCoreTypes.IFriendInfo>(
      list,
      {
        firstKey: 'alias',
        secondKey: 'nick',
        thirdKey: 'account',
      },
      false
    )

    return group.map((item) => item.data).flat()
  }, [list])

  const rowRenderer = useCallback(
    ({ index, key, style }) => {
      const item = dataSource[index]

      return (
        <div style={style} key={key}>
          <FriendItem
            key={item.account}
            account={item.account}
            onItemClick={onItemClick}
            afterSendMsgClick={afterSendMsgClick}
            prefix={prefix}
            commonPrefix={commonPrefix}
          />
        </div>
      )
    },
    [afterSendMsgClick, commonPrefix, dataSource, onItemClick, prefix]
  )

  return (
    <div className={`${_prefix}-wrapper`}>
      <div className={`${_prefix}-title`}>
        {renderFriendListHeader
          ? renderFriendListHeader()
          : t('friendListTitle')}
      </div>
      <div className={`${_prefix}-list`}>
        {loading ? (
          <Spin />
        ) : !list.length ? (
          renderFriendListEmpty ? (
            renderFriendListEmpty()
          ) : (
            <Empty style={{ marginTop: 10 }} />
          )
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                overscanRowCount={10}
                rowCount={dataSource.length}
                rowHeight={46}
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
