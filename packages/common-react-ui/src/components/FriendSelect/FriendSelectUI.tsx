import React, { FC, useMemo } from 'react'
import { Divider, message, Spin } from 'antd'
import { FriendSelectItem } from './FriendSelectItem'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { groupByPy } from '../../utils'
import { useTranslation } from '../../hooks/useTranslation'

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
    return groupByPy<NimKitCoreTypes.IFriendInfo>(list, 'nick', false)
  }, [list])

  const handleSelect = (account: string, selected: boolean) => {
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
  }

  const selectedList = useMemo(() => {
    return list.filter((item) => selectedAccounts.includes(item.account))
  }, [list, selectedAccounts])

  return (
    <div className={`${_prefix}-wrapper`}>
      {loading ? (
        <Spin />
      ) : (
        <>
          <div className={`${_prefix}-left`}>
            {dataSource.map(({ key, data }) => {
              return (
                <div key={key}>
                  <div className={`${_prefix}-subtitle-item`}>{key}</div>
                  {data.map((item) => (
                    <FriendSelectItem
                      key={`${key}_${item.account}`}
                      isSelected={selectedAccounts.includes(item.account)}
                      onSelect={handleSelect}
                      canSelect={true}
                      prefix={prefix}
                      {...item}
                    />
                  ))}
                </div>
              )
            })}
          </div>
          <Divider className={`${_prefix}-divider`} type="vertical" />
          <div className={`${_prefix}-right`}>
            <div className={`${_prefix}-selected-title`}>
              {t('selectedText')}：{selectedAccounts.length} {t('friendsText')}
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
