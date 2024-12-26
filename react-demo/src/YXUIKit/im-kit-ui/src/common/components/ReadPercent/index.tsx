import React, { useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { Popover } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

export interface ReadPercentProps {
  unread: number
  read: number
  hoverable?: boolean
  size?: number
  prefix?: string
}

export const ReadPercent: React.FC<ReadPercentProps> = ({
  unread,
  read,
  size = 8,
  hoverable = false,
  prefix = 'common',
}) => {
  const _prefix = `${prefix}-percent`
  const { t } = useTranslation()

  const renderDetail = () => {
    return (
      <span>
        {percent >= 360
          ? t('allReadText')
          : `${t('unreadText')} ${unread} ${t('personUnit')} | ${t(
              'readText'
            )} ${read} ${t('personUnit')}`}
      </span>
    )
  }

  // const renderSvg = () => {
  //   return percent >= 100 ? (
  //     <CommonIcon
  //       style={{ fontSize: radius * 2 }}
  //       type="icon-yidu"
  //       className={`${_prefix}-wrap-icon`}
  //     />
  //   ) : (
  //     <svg
  //       className={`${_prefix}-wrap-svg`}
  //       height={radius * 2}
  //       width={radius * 2}
  //       viewBox={`0 0 ${radius * 2} ${radius * 2}`}
  //     >
  //       <circle
  //         className={`${_prefix}-wrap-svg-bg`}
  //         r={radius - 1}
  //         cx={radius}
  //         cy={radius}
  //         strokeWidth="1.5"
  //       />
  //       <circle
  //         className={`${_prefix}-wrap-svg-content`}
  //         r={radius / 2}
  //         cx={radius}
  //         cy={radius}
  //         fill="transparent"
  //         strokeWidth={radius}
  //         strokeDasharray={`calc(${percent} * ${radius} * 3.14 / 100) calc(${radius} * 3.14)`}
  //         transform={`rotate(-90 ${radius} ${radius})`}
  //       />
  //     </svg>
  //   )
  // }

  const percent = useMemo(() => {
    return (read / (unread + read)) * 360 || 0
  }, [read, unread])

  const renderReadPercent = () => {
    return (
      <div className={`${prefix}-percent-wrap-read-icon-wrap`}>
        {percent >= 360 ? (
          <CheckCircleOutlined
            style={{
              fontSize: size,
            }}
            className={`${prefix}-percent-wrap-read-icon`}
          />
        ) : percent == 0 ? (
          <div
            style={{
              width: size,
              height: size,
            }}
            className={`${prefix}-percent-wrap-unread-icon`}
          >
            <div
              style={{
                width: size - 2,
                height: size - 2,
              }}
              className={`${prefix}-percent-wrap-unread-icon-inner`}
            ></div>
          </div>
        ) : (
          <div
            style={{
              width: size,
              height: size,
            }}
            className={`${prefix}-percent-wrap-sector`}
          >
            <span
              className="cover-1"
              style={{ transform: `rotate(${percent}deg)` }}
            ></span>
            <span
              className={percent >= 180 ? 'cover-2 cover-3' : 'cover-2'}
            ></span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${_prefix}-wrap`}>
      {hoverable ? (
        <Popover placement="top" content={renderDetail()}>
          {renderReadPercent()}
        </Popover>
      ) : (
        renderReadPercent()
      )}
    </div>
  )
}
