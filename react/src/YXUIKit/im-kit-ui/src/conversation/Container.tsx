import React, { FC, useMemo } from 'react'
import {
  ConversationList,
  ConversationCallbackProps,
} from './components/ConversationList'
import { useStateContext, useEventTracking } from '../common'
import packageJson from '../../package.json'
import { observer } from 'mobx-react'
import { V2NIMConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMConversationService'
import sdkPkg from 'nim-web-sdk-ng/package.json'
import { V2NIMConst } from 'nim-web-sdk-ng'
import { PinAIList } from './components/pinAIList'

export interface ConversationContainerProps {
  /**
   样式前缀
   */
  prefix?: string
  /**
   公共样式前缀
   */
  commonPrefix?: string
  /**
   会话点击事件
   */
  onConversationItemClick?: (id: string) => void
  /**
   会话删除事件
   */
  onConversationItemDeleteClick?: (id: string) => void
  /**
   会话置顶状态改变事件
   */
  onConversationItemStickTopChange?: (id: string, isTop: boolean) => void
  /**
   会话免打扰状态改变事件
   */
  onConversationItemMuteChange?: (id: string, mute: boolean) => void
  /**
   自定义渲染会话列表为空时内容
   */
  renderConversationListEmpty?: () => JSX.Element | null | undefined
  /**
   自定义渲染会话类型是单聊的内容
   */
  renderCustomP2pConversation?: (
    options: {
      conversation: V2NIMConversation
    } & ConversationCallbackProps
  ) => JSX.Element | null | undefined
  /**
   自定义渲染会话类型是群聊的内容
   */
  renderCustomTeamConversation?: (
    options: {
      conversation: V2NIMConversation
    } & Omit<ConversationCallbackProps, 'onConversationItemMuteChange'>
  ) => JSX.Element | null | undefined
  /**
   自定义会话名称。如果 p2p 会话定义了 renderCustomP2pConversation 或群组会话定义了 renderCustomTeamConversation 则不生效。
   */
  renderConversationName?: (options: {
    conversation: V2NIMConversation
  }) => JSX.Element | null | undefined
  /**
   自定义会话消息。如果 p2p 会话定义了 renderCustomP2pConversation 或群组会话定义了 renderCustomTeamConversation 则不生效。
   */
  renderConversationMsg?: (options: {
    conversation: V2NIMConversation
  }) => JSX.Element | null | undefined
  /**
   自定义 p2p 会话头像。如果定义了 renderCustomP2pConversation 则不生效。
   */
  renderP2pConversationAvatar?: (options: {
    conversation: V2NIMConversation
  }) => JSX.Element | null | undefined
  /**
   自定义群组会话头像。如果定义了 renderCustomTeamConversation 则不生效。
   */
  renderTeamConversationAvatar?: (options: {
    conversation: V2NIMConversation
  }) => JSX.Element | null | undefined
}

export const ConversationContainer: FC<ConversationContainerProps> = observer(
  ({
    prefix = 'conversation',
    commonPrefix = 'common',
    onConversationItemClick,
    onConversationItemDeleteClick,
    onConversationItemStickTopChange,
    onConversationItemMuteChange,
    renderConversationListEmpty,
    renderCustomP2pConversation,
    renderCustomTeamConversation,
    renderP2pConversationAvatar,
    renderTeamConversationAvatar,
    renderConversationName,
    renderConversationMsg,
  }) => {
    const _prefix = `${prefix}-wrapper`

    const { nim, store, localOptions } = useStateContext()

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'ConversationUIKit',
      imVersion: sdkPkg.version,
    })

    const handleConversationItemClick = async (
      conversation: V2NIMConversation
    ) => {
      await store.uiStore.selectConversation(conversation.conversationId)
      onConversationItemClick?.(conversation.conversationId)
    }

    const handleConversationItemDeleteClick = async (
      conversation: V2NIMConversation
    ) => {
      await store.conversationStore.deleteConversationActive(
        conversation.conversationId
      )
      onConversationItemDeleteClick?.(conversation.conversationId)
    }

    const handleConversationItemStickTopChange = async (
      conversation: V2NIMConversation,
      isTop: boolean
    ) => {
      await store.conversationStore.stickTopConversationActive(
        conversation.conversationId,
        isTop
      )
      onConversationItemStickTopChange?.(conversation.conversationId, isTop)
    }

    const handleConversationItemMuteChange = async (
      conversation: V2NIMConversation,
      mute: boolean
    ) => {
      await store.relationStore.setP2PMessageMuteModeActive(
        nim.V2NIMConversationIdUtil.parseConversationTargetId(
          conversation.conversationId
        ),
        mute
          ? V2NIMConst.V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_ON
          : V2NIMConst.V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_OFF
      )
      onConversationItemMuteChange?.(conversation.conversationId, mute)
    }

    const conversations = useMemo(() => {
      return store.uiStore.conversations.sort(
        (a, b) => b.sortOrder - a.sortOrder
      )
    }, [store.uiStore.conversations])

    return (
      <div className={_prefix}>
        {localOptions.aiVisible ? (
          <PinAIList prefix={prefix} commonPrefix={commonPrefix} />
        ) : null}
        <ConversationList
          conversations={conversations}
          selectedConversation={store.uiStore.selectedConversation}
          onConversationItemClick={handleConversationItemClick}
          onConversationItemDeleteClick={handleConversationItemDeleteClick}
          onConversationItemStickTopChange={
            handleConversationItemStickTopChange
          }
          onConversationItemMuteChange={handleConversationItemMuteChange}
          renderCustomP2pConversation={renderCustomP2pConversation}
          renderCustomTeamConversation={renderCustomTeamConversation}
          renderConversationListEmpty={renderConversationListEmpty}
          renderP2pConversationAvatar={renderP2pConversationAvatar}
          renderTeamConversationAvatar={renderTeamConversationAvatar}
          renderConversationName={renderConversationName}
          renderConversationMsg={renderConversationMsg}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
      </div>
    )
  }
)
