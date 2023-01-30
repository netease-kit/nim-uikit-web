import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { Popover } from 'antd'
import CommonIcon from '../CommonIcon'

export interface ReadPercentProps {
  unread: number
  read: number
  hoverable?: boolean
  radius?: number

  prefix?: string
}

export const ReadPercent: React.FC<ReadPercentProps> = ({
  unread,
  read,
  radius = 8,
  hoverable = false,
  prefix = 'common',
}) => {
  const _prefix = `${prefix}-percent`
  const { t } = useTranslation()

  const percent = (read / (unread + read)) * 100 || 0

  const renderDetail = () => {
    return (
      <span>
        {percent >= 100
          ? t('allReadText')
          : `${t('unreadText')} ${unread} ${t('personUnit')} | ${t(
              'readText'
            )} ${read} ${t('personUnit')}`}
      </span>
    )
  }

  const renderSvg = () => {
    return percent >= 100 ? (
      <CommonIcon
        style={{ fontSize: radius * 2 }}
        type="icon-yidu"
        className={`${_prefix}-wrap-icon`}
      />
    ) : (
      <svg
        className={`${_prefix}-wrap-svg`}
        height={radius * 2}
        width={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        <circle
          className={`${_prefix}-wrap-svg-bg`}
          r={radius - 1}
          cx={radius}
          cy={radius}
          strokeWidth="1.5"
        />
        <circle
          className={`${_prefix}-wrap-svg-content`}
          r={radius / 2}
          cx={radius}
          cy={radius}
          fill="transparent"
          strokeWidth={radius}
          strokeDasharray={`calc(${percent} * ${radius} * 3.14 / 100) calc(${radius} * 3.14)`}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
    )
  }

  return (
    <div className={`${_prefix}-wrap`}>
      {hoverable ? (
        <Popover placement="top" content={renderDetail()}>
          {renderSvg()}
        </Popover>
      ) : (
        renderSvg()
      )}
    </div>
  )
}
