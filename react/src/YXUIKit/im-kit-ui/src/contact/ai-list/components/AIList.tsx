import React, { FC } from 'react'
import { AIItem } from './AIItem'
import { useTranslation } from '../../../common'
import { Spin, Empty } from 'antd'
import { V2NIMAIUser } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMAIService'

export interface AIListProps {
  list: V2NIMAIUser[]
  loading?: boolean
  onItemClick?: (aiUser: V2NIMAIUser) => void
  afterSendMsgClick?: () => void
  renderAIListHeader?: () => JSX.Element
  renderAIListEmpty?: () => JSX.Element
  prefix?: string
  commonPrefix?: string
}

export const AIList: FC<AIListProps> = ({
  list,
  loading = false,
  onItemClick,
  afterSendMsgClick,
  renderAIListEmpty,
  renderAIListHeader,
  prefix = 'contact',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-ai`

  const { t } = useTranslation()

  return (
    <div className={`${_prefix}-wrapper`}>
      <div className={`${_prefix}-title`}>
        {renderAIListHeader ? renderAIListHeader() : t('aiListTitle')}
      </div>
      <div className={`${_prefix}-content`}>
        {loading ? (
          <Spin />
        ) : !list.length ? (
          renderAIListEmpty ? (
            renderAIListEmpty()
          ) : (
            <Empty style={{ marginTop: 10 }} />
          )
        ) : (
          list.map((item) => (
            <AIItem
              aiUser={item}
              key={item.accountId}
              prefix={prefix}
              commonPrefix={commonPrefix}
              onItemClick={onItemClick}
              afterSendMsgClick={afterSendMsgClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
