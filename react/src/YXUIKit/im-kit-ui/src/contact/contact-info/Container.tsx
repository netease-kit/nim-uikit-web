import React from 'react'
import { observer } from 'mobx-react'
import { useStateContext, useEventTracking, Welcome } from '../../common'
import { FriendListContainer } from '../friend-list/Container'
import { BlackListContainer } from '../black-list/Container'
import { GroupListContainer } from '../group-list/Container'
import { MsgListContainer } from '../msg-list/Container'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

import packageJson from '../../../package.json'

export interface ContactInfoContainerProps {
  /**
    点击发送消息后的事件
    */
  afterSendMsgClick?: () => void
  /**
   好友点击事件
   */
  onFriendItemClick?: (account: string) => void
  /**
   黑名单点击事件
   */
  onBlackItemClick?: (account: string) => void
  /**
   群组点击事件
   */
  onGroupItemClick?: (team: Team) => void

  /**
    自定义渲染好友列表为空时内容
    */
  renderFriendListEmpty?: () => JSX.Element
  /**
      自定义渲染好友列表头部内容
      */
  renderFriendListHeader?: () => JSX.Element
  /**
   自定义渲染黑名单列表为空时内容
   */
  renderBlackListEmpty?: () => JSX.Element
  /**
    自定义渲染黑名单列表头部内容
    */
  renderBlackListHeader?: () => JSX.Element
  /**
    自定义渲染群组列表为空时内容
    */
  renderGroupListEmpty?: () => JSX.Element
  /**
    自定义渲染群组列表头部内容
    */
  renderGroupListHeader?: () => JSX.Element
  /**
   自定义渲染消息中心为空时内容
   */
  renderMsgListEmpty?: () => JSX.Element
  /**
    自定义渲染消息中心头部内容
    */
  renderMsgListHeader?: () => JSX.Element
  /**
   自定义渲染未选中任何列表时的内容
   */
  renderEmpty?: () => JSX.Element
  /**
    样式前缀
    */
  prefix?: string
  /**
    公共样式前缀
    */
  commonPrefix?: string
}

export const ContactInfoContainer: React.FC<ContactInfoContainerProps> =
  observer(
    ({
      onBlackItemClick,
      onFriendItemClick,
      onGroupItemClick,
      renderBlackListEmpty,
      renderBlackListHeader,
      renderFriendListEmpty,
      renderFriendListHeader,
      renderGroupListEmpty,
      renderGroupListHeader,
      renderMsgListEmpty,
      renderMsgListHeader,
      renderEmpty,
      afterSendMsgClick,
      prefix = 'contact',
      commonPrefix = 'common',
    }) => {
      const { store, nim, initOptions } = useStateContext()

      useEventTracking({
        appkey: initOptions.appkey,
        version: packageJson.version,
        component: 'ContactUIKit',
        imVersion: nim.version,
      })

      return store.uiStore.selectedContactType === 'friendList' ? (
        <FriendListContainer
          onItemClick={onFriendItemClick}
          renderFriendListEmpty={renderFriendListEmpty}
          renderFriendListHeader={renderFriendListHeader}
          afterSendMsgClick={afterSendMsgClick}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
      ) : store.uiStore.selectedContactType === 'blackList' ? (
        <BlackListContainer
          onItemClick={onBlackItemClick}
          renderBlackListEmpty={renderBlackListEmpty}
          renderBlackListHeader={renderBlackListHeader}
          afterSendMsgClick={afterSendMsgClick}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
      ) : store.uiStore.selectedContactType === 'groupList' ? (
        <GroupListContainer
          onItemClick={onGroupItemClick}
          renderGroupListEmpty={renderGroupListEmpty}
          renderGroupListHeader={renderGroupListHeader}
          prefix={prefix}
        />
      ) : store.uiStore.selectedContactType === 'msgList' ? (
        <MsgListContainer
          renderMsgListEmpty={renderMsgListEmpty}
          renderMsgListHeader={renderMsgListHeader}
          afterSendMsgClick={afterSendMsgClick}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
      ) : renderEmpty ? (
        renderEmpty()
      ) : (
        <Welcome prefix={commonPrefix} />
      )
    }
  )
