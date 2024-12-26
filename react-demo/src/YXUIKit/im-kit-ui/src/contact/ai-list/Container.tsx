import React, { FC } from 'react'
import { AIList } from './components/AIList'
import { useEventTracking, useStateContext } from '../../common'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'
import sdkPkg from 'nim-web-sdk-ng/package.json'
import { V2NIMAIUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService'

export interface AIListContainerProps {
  /**
   数字人点击事件
   */
  onItemClick?: (aiUser: V2NIMAIUser) => void
  /**
   点击发送消息后的事件
   */
  afterSendMsgClick?: () => void
  /**
   自定义渲染数字人列表为空时内容
   */
  renderAIListEmpty?: () => JSX.Element
  /**
   自定义渲染数字人列表头部内容
   */
  renderAIListHeader?: () => JSX.Element
  /**
   样式前缀
   */
  prefix?: string
  /**
   公共样式前缀
   */
  commonPrefix?: string
}

export const AIListContainer: FC<AIListContainerProps> = observer(
  ({
    onItemClick,
    afterSendMsgClick,
    renderAIListEmpty,
    renderAIListHeader,
    prefix = 'contact',
    commonPrefix = 'common',
  }) => {
    const { store, nim } = useStateContext()

    const aiUsers = store.aiUserStore.getAIUserList()

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: sdkPkg.version,
    })

    return (
      <AIList
        list={aiUsers}
        onItemClick={onItemClick}
        afterSendMsgClick={afterSendMsgClick}
        renderAIListHeader={renderAIListHeader}
        renderAIListEmpty={renderAIListEmpty}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    )
  }
)
