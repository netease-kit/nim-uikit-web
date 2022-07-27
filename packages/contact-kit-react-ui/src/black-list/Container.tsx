import React, { FC, useContext, useMemo, useEffect, useState } from 'react'
import { Spin } from 'antd'
import { BlackList } from './components/BlackList'
import { Context, useEventTracking } from '@xkit-yx/common-ui'
import { logger } from '../logger'
import packageJson from '../../package.json'

export interface BlackListContainerProps {
  /**
   黑名单点击事件
   */
  onItemClick?: (account: string) => void
  /**
   点击发送消息后的事件
   */
  afterSendMsgClick?: () => void
  /**
   自定义渲染黑名单列表为空时内容
   */
  renderBlackListEmpty?: () => JSX.Element
  /**
   自定义渲染黑名单列表头部内容
   */
  renderBlackListHeader?: () => JSX.Element
  /**
   样式前缀
   */
  prefix?: string
  /**
   公共样式前缀
   */
  commonPrefix?: string
}

export const BlackListContainer: FC<BlackListContainerProps> = ({
  onItemClick,
  afterSendMsgClick,
  renderBlackListEmpty,
  renderBlackListHeader,
  prefix = 'contact',
  commonPrefix = 'common',
}) => {
  // 在这里汇聚所有需要用到的 Context，并完成数据的操作传递给纯渲染组件
  const { nim, state, dispatch, initOptions } = useContext(Context)

  // 这里需要对用到的 Context 中的值判空并做好提示
  if (!nim || !state || !dispatch || !initOptions) {
    throw new Error('Please use Provider to wrap BlackListContainer.')
  }
  const [blackListLoading, setBlackListLoading] = useState<boolean>(false)

  useEventTracking({
    appkey: initOptions.appkey,
    version: packageJson.version,
    component: 'contact-kit',
    imVersion: nim.version,
  })

  useEffect(() => {
    setBlackListLoading(true)
    nim
      .getBlackList()
      .then((list) => {
        logger.log('获取黑名单列表成功：', list)
        dispatch({
          type: 'updateBlacks',
          payload: list,
        })
      })
      .catch((err) => {
        logger.error('获取黑名单列表失败：', err)
      })
      .finally(() => {
        setBlackListLoading(false)
      })
  }, [nim, dispatch])

  const blackListRenderer = useMemo(() => {
    if (blackListLoading) {
      return <Spin />
    }
    if (!state.blackList.length) {
      return renderBlackListEmpty ? renderBlackListEmpty() : null
    }

    return (
      <BlackList
        list={state.blackList}
        onItemClick={onItemClick}
        afterSendMsgClick={afterSendMsgClick}
        renderBlackListHeader={renderBlackListHeader}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    )
  }, [
    state.blackList,
    prefix,
    commonPrefix,
    onItemClick,
    afterSendMsgClick,
    blackListLoading,
    renderBlackListEmpty,
    renderBlackListHeader,
  ])

  return blackListRenderer
}
