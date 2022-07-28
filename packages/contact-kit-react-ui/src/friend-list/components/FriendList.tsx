import React, { FC, useMemo } from 'react'
import { Utils, useTranslation } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { FriendItem } from './FriendItem'

export interface FriendListProps {
  list: NimKitCoreTypes.IFriendInfo[]
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  renderFriendListHeader?: () => JSX.Element
  prefix?: string
  commonPrefix?: string
}

export const FriendList: FC<FriendListProps> = ({
  list,
  onItemClick,
  afterSendMsgClick,
  renderFriendListHeader,
  prefix = 'contact',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-friend`

  const { t } = useTranslation()

  const dataSource = useMemo(() => {
    return Utils.groupByPy<NimKitCoreTypes.IFriendInfo>(list, 'nick', false)
  }, [list])

  return (
    <div className={`${_prefix}-wrapper`}>
      <div className={`${_prefix}-title`}>
        {renderFriendListHeader
          ? renderFriendListHeader()
          : t('friendListTitle')}
      </div>
      {dataSource.map(({ key, data }) => {
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
      })}
    </div>
  )
}
