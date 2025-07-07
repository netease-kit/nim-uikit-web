import React, { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { Empty, Popover } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'
import { useStateContext } from '../../hooks/useStateContext'
import { ComplexAvatarContainer } from '../ComplexAvatar'
import { AutoSizer, List } from 'react-virtualized'

export interface ReadPercentProps {
  unread: number
  read: number
  hoverable?: boolean
  size?: number
  prefix?: string
  message?: V2NIMMessage
}

export const ReadPercent: React.FC<ReadPercentProps> = ({
  unread,
  read,
  size = 8,
  hoverable = false,
  prefix = 'common',
  message,
}) => {
  const _prefix = `${prefix}-percent`
  const { t } = useTranslation()
  const [readAccountList, setReadAccountList] = React.useState<string[]>([])
  const [unreadAccountList, setUnreadAccountList] = React.useState<string[]>([])
  const { store } = useStateContext()
  const [isPopoverVisible, setIsPopoverVisible] = React.useState(false)

  useEffect(() => {
    if (message && isPopoverVisible) {
      store.msgStore.getTeamMessageReceiptDetailsActive(message).then((res) => {
        setReadAccountList(res?.readAccountList)
        setUnreadAccountList(res?.unreadAccountList)
      })
    }
  }, [message, isPopoverVisible])

  const unReadRowRenderer = useCallback(
    ({ index, style }) => {
      const item = unreadAccountList[index]
      const { receiverId } = message!

      return (
        <div
          key={item}
          style={style}
          className={`${_prefix}-wrap-detail-list-item`}
        >
          <ComplexAvatarContainer size={34} prefix={prefix} account={item} />
          <div className={`${_prefix}-wrap-detail-list-item-nick`}>
            {store.uiStore.getAppellation({
              account: item,
              teamId: receiverId,
            })}
          </div>
        </div>
      )
    },
    [unreadAccountList, _prefix, message, prefix]
  )

  const readRowRenderer = useCallback(
    ({ index, style }) => {
      const item = readAccountList[index]
      const { receiverId } = message!

      return (
        <div
          key={item}
          style={style}
          className={`${_prefix}-wrap-detail-list-item`}
        >
          <ComplexAvatarContainer size={34} prefix={prefix} account={item} />
          <div className={`${_prefix}-wrap-detail-list-item-nick`}>
            {store.uiStore.getAppellation({
              account: item,
              teamId: receiverId,
            })}
          </div>
        </div>
      )
    },
    [readAccountList, _prefix, message, prefix]
  )

  const renderDetail = () => {
    if (percent >= 360) {
      return t('allReadText')
    }

    return (
      <div className={`${_prefix}-wrap-detail-list`}>
        <div className={`${_prefix}-wrap-detail-list-column`}>
          <div className={`${_prefix}-wrap-detail-list-title`}>
            {t('unreadText') + unread + t('personUnit')}
          </div>
          {unreadAccountList.length ? (
            <div className={`${_prefix}-wrap-detail-list-column-content`}>
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    style={{ backfaceVisibility: 'hidden', zIndex: 1 }}
                    height={height}
                    overscanRowCount={10}
                    rowCount={unreadAccountList.length}
                    rowHeight={44}
                    rowRenderer={unReadRowRenderer}
                    width={width}
                  />
                )}
              </AutoSizer>
            </div>
          ) : (
            <Empty
              style={{
                width: '100px',
              }}
              description=""
            />
          )}
        </div>
        <div className={`${_prefix}-wrap-detail-list-column`}>
          <div className={`${_prefix}-wrap-detail-list-title`}>
            {t('readText') + read + t('personUnit')}
          </div>
          {readAccountList.length ? (
            <div className={`${_prefix}-wrap-detail-list-column-content`}>
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    style={{ backfaceVisibility: 'hidden', zIndex: 1 }}
                    height={height}
                    overscanRowCount={10}
                    rowCount={readAccountList.length}
                    rowHeight={44}
                    rowRenderer={readRowRenderer}
                    width={width}
                  />
                )}
              </AutoSizer>
            </div>
          ) : (
            <Empty
              style={{
                width: '100px',
              }}
              description=""
            />
          )}
        </div>
      </div>
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
        <div
          onMouseEnter={() => {
            setIsPopoverVisible(true)
          }}
          onMouseLeave={() => {
            setIsPopoverVisible(false)
          }}
        >
          <Popover trigger="hover" placement="top" content={renderDetail()}>
            {renderReadPercent()}
          </Popover>
        </div>
      ) : (
        renderReadPercent()
      )}
    </div>
  )
}
