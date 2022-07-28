import React, { FC } from 'react'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { BlackItem } from './BlackItem'
import { useTranslation } from '@xkit-yx/common-ui'

export interface BlackListProps {
  list: NimKitCoreTypes.IBlackInfo[]
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  renderBlackListHeader?: () => React.ReactNode
  prefix?: string
  commonPrefix?: string
}

export const BlackList: FC<BlackListProps> = ({
  list,
  onItemClick,
  afterSendMsgClick,
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
        {list.map((item) => (
          <BlackItem
            key={item.account}
            prefix={prefix}
            commonPrefix={commonPrefix}
            onItemClick={onItemClick}
            afterSendMsgClick={afterSendMsgClick}
            {...item}
          />
        ))}
      </div>
    </div>
  )
}
