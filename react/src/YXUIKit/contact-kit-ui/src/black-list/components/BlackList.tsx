import React, { FC } from 'react'
import { BlackItem } from './BlackItem'
import { useTranslation } from '../../../../common-ui/src'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { Spin, Empty } from 'antd'

export interface BlackListProps {
  list: NimKitCoreTypes.IFriendInfo[]
  loading?: boolean
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  renderBlackListHeader?: () => JSX.Element
  renderBlackListEmpty?: () => JSX.Element
  prefix?: string
  commonPrefix?: string
}

export const BlackList: FC<BlackListProps> = ({
  list,
  loading = false,
  onItemClick,
  afterSendMsgClick,
  renderBlackListEmpty,
  renderBlackListHeader,
  prefix = 'contact',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-black`

  const { t } = useTranslation()

  return (
    <div className={`${_prefix}-wrapper`}>
      <div className={`${_prefix}-title`}>
        {renderBlackListHeader ? (
          renderBlackListHeader()
        ) : (
          <>
            {t('blackListTitle')}
            <span className={`${_prefix}-title-remark`}>
              {t('blackListDesc')}
            </span>
          </>
        )}
      </div>
      <div className={`${_prefix}-content`}>
        {loading ? (
          <Spin />
        ) : !list.length ? (
          renderBlackListEmpty ? (
            renderBlackListEmpty()
          ) : (
            <Empty style={{ marginTop: 10 }} />
          )
        ) : (
          list.map((item) => (
            <BlackItem
              key={item.account}
              prefix={prefix}
              commonPrefix={commonPrefix}
              onItemClick={onItemClick}
              afterSendMsgClick={afterSendMsgClick}
              {...item}
            />
          ))
        )}
      </div>
    </div>
  )
}
