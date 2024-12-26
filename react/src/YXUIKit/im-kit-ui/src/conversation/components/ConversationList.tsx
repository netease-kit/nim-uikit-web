import React, { useCallback } from 'react'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { P2PItem } from './P2PItem'
import { GroupItem } from './GroupItem'
import { Spin, Empty } from 'antd'
import { AutoSizer, List } from 'react-virtualized'

export type ConversationCallbackProps = {
  onSessionItemClick: (session: NimKitCoreTypes.ISession) => void
  onSessionItemDeleteClick: (session: NimKitCoreTypes.ISession) => void
  onSessionItemStickTopChange: (
    session: NimKitCoreTypes.ISession,
    isTop: boolean
  ) => void
  onSessionItemMuteChange: (
    session: NimKitCoreTypes.ISession,
    mute: boolean
  ) => void
}

export type ConversationListProps = {
  sessions: NimKitCoreTypes.ISession[]
  loading?: boolean
  selectedSession?: string
  renderCustomTeamSession?: (
    options: { session: NimKitCoreTypes.TeamSession } & Omit<
      ConversationCallbackProps,
      'onSessionItemMuteChange'
    >
  ) => JSX.Element | null | undefined
  renderCustomP2pSession?: (
    options: { session: NimKitCoreTypes.P2PSession } & ConversationCallbackProps
  ) => JSX.Element | null | undefined
  renderSessionListEmpty?: () => JSX.Element | null | undefined
  renderSessionName?: (options: {
    session: NimKitCoreTypes.ISession
  }) => JSX.Element | null | undefined
  renderSessionMsg?: (options: {
    session: NimKitCoreTypes.ISession
  }) => JSX.Element | null | undefined
  renderP2pSessionAvatar?: (options: {
    session: NimKitCoreTypes.ISession
  }) => JSX.Element | null | undefined
  renderTeamSessionAvatar?: (options: {
    session: NimKitCoreTypes.ISession
  }) => JSX.Element | null | undefined

  prefix?: string
  commonPrefix?: string
} & ConversationCallbackProps

export const ConversationList: React.FC<ConversationListProps> = ({
  sessions,
  loading = false,
  selectedSession,
  onSessionItemClick,
  onSessionItemDeleteClick,
  onSessionItemStickTopChange,
  onSessionItemMuteChange,
  renderCustomP2pSession,
  renderCustomTeamSession,
  renderSessionListEmpty,
  renderP2pSessionAvatar,
  renderTeamSessionAvatar,
  renderSessionMsg,
  renderSessionName,
  prefix = 'conversation',
  commonPrefix = 'common',
}) => {
  const conversationRowRenderer = useCallback(
    ({ index, key, style }) => {
      const item = sessions[index]
      return (
        <div key={key} style={style}>
          {item.scene === 'p2p'
            ? renderCustomP2pSession?.({
                session: item as NimKitCoreTypes.P2PSession,
                onSessionItemClick,
                onSessionItemDeleteClick,
                onSessionItemMuteChange,
                onSessionItemStickTopChange,
              }) ?? (
                <P2PItem
                  {...(item as NimKitCoreTypes.P2PSession)}
                  key={item.id}
                  id={item.id}
                  prefix={prefix}
                  commonPrefix={commonPrefix}
                  isSelected={selectedSession === item.id}
                  onItemClick={() => {
                    onSessionItemClick(item)
                  }}
                  onDeleteClick={() => {
                    onSessionItemDeleteClick(item)
                  }}
                  onStickTopChange={(isTop) => {
                    onSessionItemStickTopChange(item, isTop)
                  }}
                  onMuteChange={(mute) => {
                    onSessionItemMuteChange(item, mute)
                  }}
                  sessionNameRenderer={renderSessionName?.({ session: item })}
                  sessionMsgRenderer={renderSessionMsg?.({ session: item })}
                  avatarRenderer={renderP2pSessionAvatar?.({ session: item })}
                />
              )
            : renderCustomTeamSession?.({
                session: item as NimKitCoreTypes.TeamSession,
                onSessionItemClick,
                onSessionItemDeleteClick,
                onSessionItemStickTopChange,
              }) ?? (
                <GroupItem
                  {...(item as NimKitCoreTypes.TeamSession)}
                  key={item.id}
                  id={item.id}
                  prefix={prefix}
                  commonPrefix={commonPrefix}
                  isSelected={selectedSession === item.id}
                  onItemClick={() => {
                    onSessionItemClick(item)
                  }}
                  onDeleteClick={() => {
                    onSessionItemDeleteClick(item)
                  }}
                  onStickTopChange={(isTop) => {
                    onSessionItemStickTopChange(item, isTop)
                  }}
                  sessionNameRenderer={renderSessionName?.({ session: item })}
                  sessionMsgRenderer={renderSessionMsg?.({ session: item })}
                  avatarRenderer={renderTeamSessionAvatar?.({ session: item })}
                />
              )}
        </div>
      )
    },
    [
      prefix,
      commonPrefix,
      sessions,
      selectedSession,
      renderCustomP2pSession,
      renderCustomTeamSession,
      renderSessionName,
      renderSessionMsg,
      renderP2pSessionAvatar,
      renderTeamSessionAvatar,
      onSessionItemClick,
      onSessionItemDeleteClick,
      onSessionItemStickTopChange,
      onSessionItemMuteChange,
      onSessionItemMuteChange,
    ]
  )

  return (
    <div className={`${prefix}-list-wrapper`}>
      {loading ? (
        <Spin />
      ) : !sessions.length ? (
        renderSessionListEmpty?.() ?? <Empty style={{ marginTop: 10 }} />
      ) : (
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              overscanRowCount={10}
              rowCount={sessions.length}
              rowHeight={60}
              rowRenderer={conversationRowRenderer}
              width={width}
            />
          )}
        </AutoSizer>
      )}
    </div>
  )
}
