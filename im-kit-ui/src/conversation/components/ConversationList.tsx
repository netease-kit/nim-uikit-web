import React, { useCallback } from 'react'
import { P2PItem } from './P2PItem'
import { GroupItem } from './GroupItem'
import { Spin, Empty } from 'antd'
import { V2NIMConversationForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { AutoSizer, List } from 'react-virtualized'

export type ConversationCallbackProps = {
  onConversationItemClick: (conversation: V2NIMConversationForUI) => void
  onConversationItemDeleteClick: (conversation: V2NIMConversationForUI) => void
  onConversationItemStickTopChange: (
    conversation: V2NIMConversationForUI,
    isTop: boolean
  ) => void
  onConversationItemMuteChange: (
    conversation: V2NIMConversationForUI,
    mute: boolean
  ) => void
}

export type ConversationListProps = {
  conversations: V2NIMConversationForUI[]
  loading?: boolean
  selectedConversation?: string
  handleLoadMoreConversations: () => void
  renderCustomTeamConversation?: (
    options: { conversation: V2NIMConversationForUI } & Omit<
      ConversationCallbackProps,
      'onConversationItemMuteChange'
    >
  ) => JSX.Element | null | undefined
  renderCustomP2pConversation?: (
    options: {
      conversation: V2NIMConversationForUI
    } & ConversationCallbackProps
  ) => JSX.Element | null | undefined
  renderConversationListEmpty?: () => JSX.Element | null | undefined
  renderConversationName?: (options: {
    conversation: V2NIMConversationForUI
  }) => JSX.Element | null | undefined
  renderConversationMsg?: (options: {
    conversation: V2NIMConversationForUI
  }) => JSX.Element | null | undefined
  renderP2pConversationAvatar?: (options: {
    conversation: V2NIMConversationForUI
  }) => JSX.Element | null | undefined
  renderTeamConversationAvatar?: (options: {
    conversation: V2NIMConversationForUI
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
    ({ index, key, style }) => {
      const item = conversations[index]

      return (
        <div key={key} style={style}>
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
      renderConversationListEmpty,
      renderP2pConversationAvatar,
      renderTeamConversationAvatar,
      renderConversationMsg,
      renderConversationName,
      prefix,
      commonPrefix,
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
