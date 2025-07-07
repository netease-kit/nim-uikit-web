import React, { useCallback } from 'react'
import { P2PItem } from './P2PItem'
import { GroupItem } from './GroupItem'
import { Spin, Empty } from 'antd'
import {
  V2NIMConversationForUI,
  V2NIMLocalConversationForUI,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { AutoSizer, List } from 'react-virtualized'

export type ConversationCallbackProps = {
  onConversationItemClick: (
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
  ) => void
  onConversationItemDeleteClick: (
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
  ) => void
  onConversationItemStickTopChange: (
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI,
    isTop: boolean
  ) => void
  onConversationItemMuteChange: (
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI,
    mute: boolean
  ) => void
}

export type ConversationListProps = {
  conversations: (V2NIMConversationForUI | V2NIMLocalConversationForUI)[]
  loading?: boolean
  selectedConversation?: string
  handleLoadMoreConversations: () => void
  renderCustomTeamConversation?: (
    options: {
      conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
    } & Omit<ConversationCallbackProps, 'onConversationItemMuteChange'>
  ) => JSX.Element | null | undefined
  renderCustomP2pConversation?: (
    options: {
      conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
    } & ConversationCallbackProps
  ) => JSX.Element | null | undefined
  renderConversationListEmpty?: () => JSX.Element | null | undefined
  renderConversationName?: (options: {
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
  }) => JSX.Element | null | undefined
  renderConversationMsg?: (options: {
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
  }) => JSX.Element | null | undefined
  renderP2pConversationAvatar?: (options: {
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
  }) => JSX.Element | null | undefined
  renderTeamConversationAvatar?: (options: {
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
  }) => JSX.Element | null | undefined

  prefix?: string
  commonPrefix?: string
} & ConversationCallbackProps

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  loading = false,
  selectedConversation,
  handleLoadMoreConversations,
  onConversationItemClick,
  onConversationItemDeleteClick,
  onConversationItemStickTopChange,
  onConversationItemMuteChange,
  renderCustomP2pConversation,
  renderCustomTeamConversation,
  renderConversationListEmpty,
  renderP2pConversationAvatar,
  renderTeamConversationAvatar,
  renderConversationMsg,
  renderConversationName,
  prefix = 'conversation',
  commonPrefix = 'common',
}) => {
  const handleConversationScroll = ({
    clientHeight,
    scrollHeight,
    scrollTop,
  }) => {
    if (
      clientHeight !== undefined &&
      scrollHeight !== undefined &&
      scrollTop !== undefined
    ) {
      // 滚动到底部，加载更多会话
      const isScrolledToBottom = scrollHeight - clientHeight <= scrollTop + 10

      if (isScrolledToBottom) {
        handleLoadMoreConversations()
      }
    }
  }

  const conversationRowRenderer = useCallback(
    ({ index, style }) => {
      const item = conversations[index]

      return (
        <div key={item.conversationId} style={style}>
          {item.type ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
            ? renderCustomP2pConversation?.({
                conversation: item,
                onConversationItemClick,
                onConversationItemDeleteClick,
                onConversationItemMuteChange,
                onConversationItemStickTopChange,
              }) ?? (
                <P2PItem
                  {...item}
                  key={item.conversationId}
                  prefix={prefix}
                  commonPrefix={commonPrefix}
                  isSelected={selectedConversation === item.conversationId}
                  onItemClick={() => {
                    onConversationItemClick(item)
                  }}
                  onDeleteClick={() => {
                    onConversationItemDeleteClick(item)
                  }}
                  onStickTopChange={(isTop) => {
                    onConversationItemStickTopChange(item, isTop)
                  }}
                  onMuteChange={(mute) => {
                    onConversationItemMuteChange(item, mute)
                  }}
                  conversationNameRenderer={renderConversationName?.({
                    conversation: item,
                  })}
                  conversationMsgRenderer={renderConversationMsg?.({
                    conversation: item,
                  })}
                  avatarRenderer={renderP2pConversationAvatar?.({
                    conversation: item,
                  })}
                />
              )
            : renderCustomTeamConversation?.({
                conversation: item,
                onConversationItemClick,
                onConversationItemDeleteClick,
                onConversationItemStickTopChange,
              }) ?? (
                <GroupItem
                  {...item}
                  key={item.conversationId}
                  prefix={prefix}
                  commonPrefix={commonPrefix}
                  isSelected={selectedConversation === item.conversationId}
                  onItemClick={() => {
                    onConversationItemClick(item)
                  }}
                  onDeleteClick={() => {
                    onConversationItemDeleteClick(item)
                  }}
                  onStickTopChange={(isTop) => {
                    onConversationItemStickTopChange(item, isTop)
                  }}
                  onMuteChange={(mute) => {
                    onConversationItemMuteChange(item, mute)
                  }}
                  conversationNameRenderer={renderConversationName?.({
                    conversation: item,
                  })}
                  conversationMsgRenderer={renderConversationMsg?.({
                    conversation: item,
                  })}
                  avatarRenderer={renderTeamConversationAvatar?.({
                    conversation: item,
                  })}
                />
              )}
        </div>
      )
    },
    [
      conversations,
      commonPrefix,
      selectedConversation,
      onConversationItemClick,
      onConversationItemDeleteClick,
      onConversationItemStickTopChange,
      onConversationItemMuteChange,
      renderCustomP2pConversation,
      renderCustomTeamConversation,
      renderP2pConversationAvatar,
      renderTeamConversationAvatar,
      renderConversationMsg,
      renderConversationName,
      prefix,
    ]
  )

  return (
    <div className={`${prefix}-list-wrapper`}>
      {loading ? (
        <Spin />
      ) : !conversations.length ? (
        renderConversationListEmpty?.() ?? <Empty style={{ marginTop: 10 }} />
      ) : (
        <AutoSizer>
          {({ height, width }) => (
            <List
              // 为什么在此处设置 backfaceVisibility 属性？
              // 答：为了解决在win 10 2004 版本上，滚动时出现模糊的问题。
              // 为什么要设置 zIndex 属性？
              // 答：为了解决在win 10 2004 版本上，点击会话列表时，右侧聊天界面有视频消息时，会话列表会出现模糊的问题。（因为视频消息会带来图层合成或GPU加速导致的渲染冲突）
              style={{ backfaceVisibility: 'hidden', zIndex: 1 }}
              height={height}
              overscanRowCount={10}
              rowCount={conversations.length}
              rowHeight={60}
              rowRenderer={conversationRowRenderer}
              width={width}
              onScroll={handleConversationScroll}
            />
          )}
        </AutoSizer>
      )}
    </div>
  )
}
