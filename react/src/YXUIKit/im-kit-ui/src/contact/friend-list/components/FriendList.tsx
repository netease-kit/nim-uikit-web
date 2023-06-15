import React, { FC, useMemo } from 'react'
import { Utils, useTranslation } from '../../../common'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { FriendItem } from './FriendItem'
import { Spin, Empty } from 'antd'
// import { List } from 'react-virtualized'

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
    const res: (NimKitCoreTypes.IFriendInfo | string)[] = []
    group.forEach((item) => {
      if (!res.includes(item.key)) {
        res.push(item.key)
      }
      res.push(...item.data)
    })
    return res
  }, [list])

  // const rowHeight = (index: number) => {
  //   if (typeof dataSource[index] === 'string') {
  //     return 57
  //   }
  //   return 46
  // }

  // const rowRenderer = (data: any) => {
  //   const item = dataSource[data.index]
  //   // console.log('rowRenderer:', key, index, item)
  //   if (typeof item === 'string') {
  //     return (
  //       <div className={`${_prefix}-subtitle`} key={item}>
  //         {item}
  //       </div>
  //     )
  //   }
  //   return (
  //     <FriendItem
  //       key={item.account}
  //       account={item.account}
  //       onItemClick={onItemClick}
  //       afterSendMsgClick={afterSendMsgClick}
  //       prefix={prefix}
  //       commonPrefix={commonPrefix}
  //     />
  //   )
  // }

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
          // <List
          //   width={810}
          //   height={469}
          //   rowCount={dataSource.length}
          //   rowHeight={rowHeight}
          //   rowRenderer={rowRenderer}
          //   containerStyle={{ position: 'static' }}
          // ></List>
          dataSource.map((item) => {
            if (typeof item === 'string') {
              return (
                <div className={`${_prefix}-subtitle`} key={item}>
                  {item}
                </div>
              )
            }
            return (
              <FriendItem
                key={item.account}
                account={item.account}
                onItemClick={onItemClick}
                afterSendMsgClick={afterSendMsgClick}
                prefix={prefix}
                commonPrefix={commonPrefix}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
