import React, { FC, useMemo } from 'react'
import { Divider, message, Spin } from 'antd'
import { FriendSelectItem } from './FriendSelectItem'
import { groupByPy } from '../../../utils'
import { useTranslation } from '../../hooks/useTranslation'
import { useStateContext } from '../../hooks/useStateContext'

export interface FriendSelectUIProps {
  accounts?: string[]
  selectedAccounts: string[]
  onSelect: (accounts: string[]) => void
  loading?: boolean
  max?: number

  prefix?: string
}

export const FriendSelectUI: FC<FriendSelectUIProps> = ({
  accounts = [],
  selectedAccounts,
  onSelect,
  loading = false,
  max,
  prefix = 'common',
}) => {
  const _prefix = `${prefix}-friend-select`

  const { t } = useTranslation()
  const { store } = useStateContext()

  const dataSource = useMemo(() => {
    const _data = accounts.map((account) => ({
      account,
      appellation: store.uiStore.getAppellation({ account }),
    }))
    return groupByPy(
      _data,
      {
        firstKey: 'appellation',
      },
      false
    )
  }, [accounts, store.uiStore])

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
    const _selectedList = accounts.filter((item) =>
      _selectedAccounts.includes(item)
    )
    onSelect(_selectedList)
  }

  const selectedList = useMemo(() => {
    return accounts.filter((item) => selectedAccounts.includes(item))
  }, [accounts, selectedAccounts])

  const strangerList = useMemo(() => {
    return selectedAccounts.filter((item) => accounts.every((j) => j !== item))
  }, [accounts, selectedAccounts])

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
                  key={`select_${item}`}
                  canSelect={false}
                  prefix={prefix}
                  account={item}
                  appellation={store.uiStore.getAppellation({ account: item })}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
