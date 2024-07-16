import React, { FC, useMemo } from 'react'
import { Utils, useStateContext, useTranslation } from '../../../common'
import { FriendItem } from './FriendItem'
import { Spin, Empty } from 'antd'

export interface FriendListProps {
  accounts: string[]
  loading?: boolean
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  renderFriendListHeader?: () => JSX.Element
  renderFriendListEmpty?: () => JSX.Element
  prefix?: string
  commonPrefix?: string
}

export const FriendList: FC<FriendListProps> = ({
  accounts,
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

  const { store } = useStateContext()

  const dataSource = useMemo(() => {
    const data = accounts.map((account) => ({
      account,
      appellation: store.uiStore.getAppellation({ account }),
    }))

    const group = Utils.groupByPy(
      data,
      {
        firstKey: 'appellation',
      },
      false
    )

    const res: ({ account: string; appellation: string } | string)[] = []

    group.forEach((item) => {
      if (!res.includes(item.key)) {
        res.push(item.key)
      }

      res.push(...item.data)
    })
    return res
  }, [accounts, store.uiStore])

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
        ) : !accounts.length ? (
          renderFriendListEmpty ? (
            renderFriendListEmpty()
          ) : (
            <Empty style={{ marginTop: 10 }} />
          )
        ) : (
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
