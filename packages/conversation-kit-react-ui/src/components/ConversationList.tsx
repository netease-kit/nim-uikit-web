import React from 'react'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { P2PItem } from './P2PItem'
import { GroupItem } from './GroupItem'
import { Spin, Empty } from 'antd'

export type ConversationCallbackProps = {
  onSessionItemClick: (session: NimKitCoreTypes.ISession) => void
  onSessionItemDeleteClick: (session: NimKitCoreTypes.ISession) => void
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
  ) => JSX.Element
  renderCustomP2pSession?: (
    options: { session: NimKitCoreTypes.P2PSession } & ConversationCallbackProps
  ) => JSX.Element
  renderSessionListEmpty?: () => JSX.Element
  prefix?: string
  commonPrefix?: string
} & ConversationCallbackProps

export const ConversationList: React.FC<ConversationListProps> = ({
  sessions,
  loading = false,
  selectedSession,
  onSessionItemClick,
  onSessionItemDeleteClick,
  onSessionItemMuteChange,
  renderCustomP2pSession,
  renderCustomTeamSession,
  renderSessionListEmpty,
  prefix = 'conversation',
  commonPrefix = 'common',
}) => {
  return (
    <div className={`${prefix}-list-wrapper`}>
      {loading ? (
        <Spin />
      ) : !sessions.length ? (
        renderSessionListEmpty ? (
          renderSessionListEmpty()
        ) : (
          <Empty style={{ marginTop: 10 }} />
        )
      ) : (
        sessions.map((item) => {
          return item.scene === 'p2p' ? (
            renderCustomP2pSession ? (
              renderCustomP2pSession({
                session: item as NimKitCoreTypes.P2PSession,
                onSessionItemClick,
                onSessionItemDeleteClick,
                onSessionItemMuteChange,
              })
            ) : (
              <P2PItem
                {...(item as NimKitCoreTypes.P2PSession)}
                key={item.id}
                prefix={prefix}
                commonPrefix={commonPrefix}
                isSelected={selectedSession === item.id}
                onItemClick={() => {
                  onSessionItemClick(item)
                }}
                onDeleteClick={() => {
                  onSessionItemDeleteClick(item)
                }}
                onMuteChange={(mute) => {
                  onSessionItemMuteChange(item, mute)
                }}
              />
            )
          ) : renderCustomTeamSession ? (
            renderCustomTeamSession({
              session: item as NimKitCoreTypes.TeamSession,
              onSessionItemClick,
              onSessionItemDeleteClick,
            })
          ) : (
            <GroupItem
              {...(item as NimKitCoreTypes.TeamSession)}
              key={item.id}
              prefix={prefix}
              commonPrefix={commonPrefix}
              isSelected={selectedSession === item.id}
              onItemClick={() => {
                onSessionItemClick(item)
              }}
              onDeleteClick={() => {
                onSessionItemDeleteClick(item)
              }}
            />
          )
        })
      )}
    </div>
  )
}
