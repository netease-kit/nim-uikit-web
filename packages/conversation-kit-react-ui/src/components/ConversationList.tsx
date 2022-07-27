import React from 'react'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { P2PItem } from './P2PItem'
import { GroupItem } from './GroupItem'

export type ISeessionProps = {
  onSessionItemClick: (session: NimKitCoreTypes.ISession) => void
  onSessionItemDeleteClick: (session: NimKitCoreTypes.ISession) => void
  onSessionItemMuteChange: (
    session: NimKitCoreTypes.ISession,
    mute: boolean
  ) => void
}

export type ConversationListProps = {
  sessions: NimKitCoreTypes.ISession[]
  selectedSession?: NimKitCoreTypes.ISession
  renderCustomTeamSession?: (
    options: { session: NimKitCoreTypes.TeamSession } & Omit<
      ISeessionProps,
      'onSessionItemMuteChange'
    >
  ) => JSX.Element
  renderCustomP2pSession?: (
    options: { session: NimKitCoreTypes.P2PSession } & ISeessionProps
  ) => JSX.Element
  prefix?: string
  commonPrefix?: string
} & ISeessionProps

export const ConversationList: React.FC<ConversationListProps> = ({
  sessions,
  selectedSession,
  onSessionItemClick,
  onSessionItemDeleteClick,
  onSessionItemMuteChange,
  renderCustomP2pSession,
  renderCustomTeamSession,
  prefix = 'conversation',
  commonPrefix = 'common',
}) => {
  return (
    <div className={`${prefix}-list-wrapper`}>
      {sessions
        .sort(
          (a, b) =>
            (b.lastMsg?.time || b.updateTime) -
            (a.lastMsg?.time || a.updateTime)
        )
        .map((item) => {
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
                isSelected={selectedSession?.id === item.id}
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
              isSelected={selectedSession?.id === item.id}
              onItemClick={() => {
                onSessionItemClick(item)
              }}
              onDeleteClick={() => {
                onSessionItemDeleteClick(item)
              }}
            />
          )
        })}
    </div>
  )
}
