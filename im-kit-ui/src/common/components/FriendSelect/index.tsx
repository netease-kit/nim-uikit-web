import React, { FC, useCallback, useMemo, useState } from 'react'
import { Divider, Spin, Tabs } from 'antd'
import { FriendSelectItem } from './FriendSelectItem'
import { groupByPy } from '../../../utils'
import { useTranslation } from '../../hooks/useTranslation'
import { useStateContext } from '../../hooks/useStateContext'
import { observer } from 'mobx-react'
import { AutoSizer, List } from 'react-virtualized'

const emptyArr = []

export interface FriendSelectUIProps {
  // 选中的人，不在 datasource 中就视为陌生人
  selectedAccounts: string[]
  // 禁止勾选的人
  disabledAccounts?: string[]
  onSelect: (accounts: string[]) => void
  loading?: boolean
  max?: number

  prefix?: string
}

export type FriendSelectTabKey = 'friend' | 'aiUser'

export interface DataSourceItem {
  account: string
  appellation: string
  visible: boolean
}

export const FriendSelect: FC<FriendSelectUIProps> = observer(
  ({
    selectedAccounts,
    disabledAccounts = emptyArr,
    onSelect,
    loading = false,
    max = Infinity,
    prefix = 'common',
  }) => {
    const _prefix = `${prefix}-friend-select`

    const { t } = useTranslation()
    const { store, localOptions } = useStateContext()

    const [tab, setTab] = useState<FriendSelectTabKey>('friend')

    const dataSource = useMemo(() => {
      const friendsWithoutBlacklist: DataSourceItem[] = store.uiStore.friends
        .filter(
          (item) => !store.relationStore.blacklist.includes(item.accountId)
        )
        .map((item) => ({
          account: item.accountId,
          appellation: store.uiStore.getAppellation({
            account: item.accountId,
          }),
          visible: tab === 'friend',
        }))

      const aiUsers: DataSourceItem[] = store.aiUserStore
        .getAIUserList()
        .map((item) => ({
          account: item.accountId,
          appellation: store.uiStore.getAppellation({
            account: item.accountId,
          }),
          visible: tab === 'aiUser',
        }))

      const finalData = [...friendsWithoutBlacklist, ...aiUsers]

      return {
        arrData: finalData,
        groupByPyData: groupByPy(
          finalData,
          {
            firstKey: 'appellation',
          },
          false
        )
          .map((item) => item.data)
          .flat()
          .filter((item) => item.visible),
      }
    }, [store.uiStore, store.relationStore.blacklist, store.aiUserStore, tab])

    const strangerList = useMemo(() => {
      return selectedAccounts.filter((item) =>
        dataSource.arrData.every((j) => j.account !== item)
      )
    }, [dataSource.arrData, selectedAccounts])

    const handleSelect = useCallback(
      (account: string, selected: boolean) => {
        let _selectedAccounts: string[] = []

        if (selected && !selectedAccounts.includes(account)) {
          _selectedAccounts = selectedAccounts.concat(account)
        } else if (!selected && selectedAccounts.includes(account)) {
          _selectedAccounts = selectedAccounts.filter(
            (item) => item !== account
          )
        }

        onSelect(_selectedAccounts)
      },
      [onSelect, selectedAccounts]
    )

    const selectedList = useMemo(() => {
      return dataSource.arrData.filter((item) =>
        selectedAccounts.includes(item.account)
      )
    }, [dataSource.arrData, selectedAccounts])

    const renderTab = () => {
      const items: {
        key: FriendSelectTabKey
        label: string
      }[] = [
        {
          key: 'friend',
          label: t('friendText'),
        },
        {
          key: 'aiUser',
          label: t('aiUserText'),
        },
      ]

      return localOptions.aiVisible ? (
        <Tabs
          className={`${_prefix}-tabs`}
          items={items}
          activeKey={tab}
          onTabClick={(key) => {
            setTab(key as FriendSelectTabKey)
          }}
        />
      ) : null
    }

    const friendSelectedRowRenderer = useCallback(
      ({ index, style }) => {
        const friend = selectedList[index]
        const key = friend.account

        return (
          <div style={style} key={key}>
            <FriendSelectItem
              key={`select_${friend.account}`}
              canSelect={false}
              prefix={prefix}
              account={friend.account}
              appellation={store.uiStore.getAppellation({
                account: friend.account,
              })}
            />
          </div>
        )
      },
      [prefix, selectedList, selectedAccounts]
    )

    const friendRowRenderer = useCallback(
      ({ index, style }) => {
        const friend = dataSource.groupByPyData[index]
        const key = friend.account

        return (
          <div style={style} key={key}>
            <FriendSelectItem
              key={friend.account}
              isSelected={selectedAccounts.includes(friend.account)}
              onSelect={handleSelect}
              canSelect={true}
              disabled={
                disabledAccounts.includes(friend.account)
                // ||
                // (selectedAccounts.length >= max &&
                //   !selectedAccounts.includes(friend.account))
              }
              prefix={prefix}
              {...friend}
            />
          </div>
        )
      },
      [
        dataSource.groupByPyData,
        disabledAccounts,
        handleSelect,
        max,
        prefix,
        selectedAccounts,
      ]
    )

    return (
      <div className={`${_prefix}-wrapper`}>
        {loading ? (
          <Spin />
        ) : (
          <>
            <div className={`${_prefix}-left`}>
              {renderTab()}
              <div className={`${_prefix}-list`}>
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      overscanRowCount={10}
                      rowCount={dataSource.groupByPyData.length}
                      rowHeight={48}
                      rowRenderer={friendRowRenderer}
                      width={width}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>
            <Divider className={`${_prefix}-divider`} type="vertical" />
            <div className={`${_prefix}-right`}>
              <div className={`${_prefix}-selected-title`}>
                {t('selectedText')}：{selectedList.length} {t('personUnit')}
                {strangerList.length ? (
                  <>
                    ，{strangerList.length} {t('strangerText')}
                  </>
                ) : null}
              </div>
              <div className={`${_prefix}-selected-content`}>
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      overscanRowCount={10}
                      rowCount={selectedList.length}
                      rowHeight={48}
                      rowRenderer={friendSelectedRowRenderer}
                      width={width}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
)
