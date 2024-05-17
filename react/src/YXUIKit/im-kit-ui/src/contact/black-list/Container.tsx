import React, { FC } from 'react'
import { BlackList } from './components/BlackList'
import { useEventTracking, useStateContext } from '../../common'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'
import sdkPkg from 'nim-web-sdk-ng/package.json'

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

export const BlackListContainer: FC<BlackListContainerProps> = observer(
  ({
    onItemClick,
    afterSendMsgClick,
    renderBlackListEmpty,
    renderBlackListHeader,
    prefix = 'contact',
    commonPrefix = 'common',
  }) => {
    const { store, nim } = useStateContext()

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: sdkPkg.version,
    })

    return (
      <BlackList
        list={store.relationStore.blacklist}
        onItemClick={onItemClick}
        afterSendMsgClick={afterSendMsgClick}
        renderBlackListHeader={renderBlackListHeader}
        renderBlackListEmpty={renderBlackListEmpty}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    )
  }
)
