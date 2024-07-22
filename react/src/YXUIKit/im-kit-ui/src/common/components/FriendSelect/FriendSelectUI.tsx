import React, { FC, useCallback, useMemo } from 'react'
import { Divider, message, Spin } from 'antd'
import { FriendSelectItem } from './FriendSelectItem'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { groupByPy } from '../../../utils'
import { useTranslation } from '../../hooks/useTranslation'
import { AutoSizer, List } from 'react-virtualized'

export interface FriendSelectUIProps {
  list: NimKitCoreTypes.IFriendInfo[]
  selectedAccounts: string[]
  onSelect: (selected: NimKitCoreTypes.IFriendInfo[]) => void
  loading?: boolean
  max?: number

  prefix?: string
}

export const FriendSelectUI: FC<FriendSelectUIProps> = ({
  list,
  selectedAccounts,
  onSelect,
  loading = false,
  max,
  prefix = 'common',
}) => {
  const _prefix = `${prefix}-friend-select`

  const { t } = useTranslation()

  const dataSource = useMemo(() => {
    return groupByPy<NimKitCoreTypes.IFriendInfo>(
      list,
      {
        firstKey: 'alias',
        secondKey: 'nick',
        thirdKey: 'account',
      },
      false
    )
      .map((item) => item.data)
      .flat()
  }, [list])

  const handleSelect = useCallback(
    (account: string, selected: boolean) => {
      let _selectedAccounts: string[] = []
      if (selected && !selectedAccounts.includes(account)) {
        if (max && selectedAccounts.length >= max) {
          message.error(`${t('maxSelectedText')}${max}${t('friendsText')}`)
          return
        }
        _selectedAccounts = selectedAccounts.concat(account)
      } else if (!selected && selectedAccounts.includes(account)) {
        _selectedAccounts = selectedAccounts.filter((item) => item !== account)
      }
      const _selectedList = list.filter((item) =>
        _selectedAccounts.includes(item.account)
      )
      onSelect(_selectedList)
    },
    [list, max, onSelect, selectedAccounts, t]
  )

  const selectedList = useMemo(() => {
    return list.filter((item) => selectedAccounts.includes(item.account))
  }, [list, selectedAccounts])

  const strangerList = useMemo(() => {
    return selectedAccounts.filter((item) =>
      list.every((j) => j.account !== item)
    )
  }, [list, selectedAccounts])

  const rowRenderer = useCallback(
    ({ index, key, style }) => {
      const item = dataSource[index]

      return (
        <div style={style} key={key}>
          <FriendSelectItem
            key={item.account}
            isSelected={selectedAccounts.includes(item.account)}
            onSelect={handleSelect}
            canSelect={true}
            prefix={prefix}
            {...item}
          />
        </div>
      )
    },
    [dataSource, handleSelect, prefix, selectedAccounts]
  )

  return (
    <div className={`${_prefix}-wrapper`}>
      {loading ? (
        <Spin />
      ) : (
        <>
          <div className={`${_prefix}-left`}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  overscanRowCount={10}
                  rowCount={dataSource.length}
                  rowHeight={40}
                  rowRenderer={rowRenderer}
                  width={width}
                />
              )}
            </AutoSizer>
          </div>
          <Divider className={`${_prefix}-divider`} type="vertical" />
          <div className={`${_prefix}-right`}>
            <div className={`${_prefix}-selected-title`}>
              {t('selectedText')}：{selectedList.length} {t('friendsText')}
              {strangerList.length ? (
                <>
                  ，{strangerList.length} {t('strangerText')}
                </>
              ) : null}
            </div>
            <div className={`${_prefix}-selected-content`}>
              {selectedList.map((item) => (
                <FriendSelectItem
                  key={`select_${item.account}`}
                  canSelect={false}
                  prefix={prefix}
                  {...item}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
