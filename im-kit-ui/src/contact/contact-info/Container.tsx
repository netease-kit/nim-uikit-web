import React from 'react'
import { observer } from 'mobx-react'
import { useStateContext, useEventTracking, Welcome } from '../../common'
import { FriendListContainer } from '../friend-list/Container'
import { BlackListContainer } from '../black-list/Container'
import { GroupListContainer } from '../group-list/Container'
import { MsgListContainer } from '../msg-list/Container'
import { AIListContainer } from '../ai-list/Container'

import packageJson from '../../../package.json'
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import sdkPgk from 'nim-web-sdk-ng/package.json'
import {
  V2NIMFriendAddApplicationForUI,
  V2NIMTeamJoinActionInfoForUI,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMAIUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService'

export interface ContactInfoContainerProps {
  /**
    点击发送消息后的事件
    */
  afterSendMsgClick?: () => void
  /**
   通过入群申请后的事件
   */
  afterAcceptApplyTeam?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  /**
    拒绝入群申请后的事件
    */
  afterRejectApplyTeam?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  /**
    通过入群邀请后的事件
    */
  afterAcceptTeamInvite?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  /**
    拒绝入群邀请后的事件
    */
  afterRejectTeamInvite?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  /**
    通过好友申请后的事件
    */
  afterAcceptApplyFriend?: (application: V2NIMFriendAddApplicationForUI) => void
  /**
    拒绝好友申请后的事件
    */
  afterRejectApplyFriend?: (application: V2NIMFriendAddApplicationForUI) => void
  /**
   好友点击事件
   */
  onFriendItemClick?: (account: string) => void
  /**
   黑名单点击事件
   */
  onBlackItemClick?: (account: string) => void
  /**
   * AI 数字人点击事件
   */
  onAIItemClick?: (aiUser: V2NIMAIUser) => void
  /**
   群组点击事件
   */
  onGroupItemClick?: (team: V2NIMTeam) => void
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
    自定义渲染数字人列表为空时内容
    */
  renderAIListEmpty?: () => JSX.Element
  /**
    自定义渲染数字人列表头部内容
    */
  renderAIListHeader?: () => JSX.Element
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
      onAIItemClick,
      onFriendItemClick,
      onGroupItemClick,
      renderBlackListEmpty,
      renderBlackListHeader,
      renderAIListEmpty,
      renderAIListHeader,
      renderFriendListEmpty,
      renderFriendListHeader,
      renderGroupListEmpty,
      renderGroupListHeader,
      renderMsgListEmpty,
      renderMsgListHeader,
      renderEmpty,
      afterSendMsgClick,
      afterAcceptApplyTeam,
      afterRejectApplyTeam,
      afterAcceptTeamInvite,
      afterRejectTeamInvite,
      afterAcceptApplyFriend,
      afterRejectApplyFriend,
      prefix = 'contact',
      commonPrefix = 'common',
    }) => {
      const { store, nim } = useStateContext()

      useEventTracking({
        appkey: nim.options.appkey,
        version: packageJson.version,
        component: 'ContactUIKit',
        imVersion: sdkPgk.version,
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
          afterAcceptApplyTeam={afterAcceptApplyTeam}
          afterRejectApplyTeam={afterRejectApplyTeam}
          afterAcceptTeamInvite={afterAcceptTeamInvite}
          afterRejectTeamInvite={afterRejectTeamInvite}
          afterAcceptApplyFriend={afterAcceptApplyFriend}
          afterRejectApplyFriend={afterRejectApplyFriend}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
      ) : store.uiStore.selectedContactType === 'aiList' ? (
        <AIListContainer
          onItemClick={onAIItemClick}
          renderAIListEmpty={renderAIListEmpty}
          renderAIListHeader={renderAIListHeader}
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
