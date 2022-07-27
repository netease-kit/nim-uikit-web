import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { mergeArrs } from '../utils'
import { Store, ActionProps, ActionTypeMap } from './types'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'

export const initialState: Store = {
  connectState: 'idle',
  sessions: [],
  selectedSession: undefined,
  blackList: [],
  groupList: [],
  friendList: [],
  selectedContactType: undefined,
  myUserInfo: {} as UserNameCard,
}

export const reducer = (
  state: Store,
  action: ActionProps<keyof ActionTypeMap>
): Store => {
  const { type, payload } = action
  switch (type) {
    case 'changeConnectState':
      return {
        ...state,
        connectState: payload as ActionTypeMap['changeConnectState'],
      }
    case 'updateSessions': {
      const newSessions = mergeArrs<NimKitCoreTypes.ISession>(
        state.sessions,
        payload as ActionTypeMap['updateSessions'],
        'id'
      )
        .filter((item) => item.lastMsg !== void 0)
        .filter((item) => item.scene !== 'superTeam')

      const selectedSession = state.selectedSession
        ? newSessions.find((i) => i.id === state.selectedSession?.id)
        : state.selectedSession
      return {
        ...state,
        sessions: newSessions,
        selectedSession,
      }
    }
    case 'clearSessions':
      return {
        ...state,
        sessions: [],
        selectedSession: undefined,
      }
    case 'deleteSessions':
      return {
        ...state,
        sessions: state.sessions.filter((i) =>
          (payload as ActionTypeMap['deleteSessions']).every((j) => j !== i.id)
        ),
        selectedSession: state.selectedSession
          ? (payload as ActionTypeMap['deleteSessions']).includes(
              state.selectedSession.id
            )
            ? undefined
            : state.selectedSession
          : state.selectedSession,
      }
    case 'selectSession': {
      return {
        ...state,
        selectedSession: payload
          ? state.sessions.find((i) => {
              return i.id === (payload as ActionTypeMap['selectSession'])?.id
            })
          : (payload as ActionTypeMap['selectSession']),
      }
    }
    case 'updateBlacks':
      return {
        ...state,
        blackList: mergeArrs<NimKitCoreTypes.IBlackInfo>(
          state.blackList,
          payload as ActionTypeMap['updateBlacks'],
          'account'
        ),
      }
    case 'deleteBlacks':
      return {
        ...state,
        blackList: state.blackList.filter((i) =>
          (payload as ActionTypeMap['deleteBlacks']).every(
            (j) => j !== i.account
          )
        ),
      }
    case 'updateGroups':
      return {
        ...state,
        groupList: mergeArrs<Team>(
          state.groupList,
          payload as ActionTypeMap['updateGroups'],
          'teamId'
        ),
      }
    case 'deleteGroups':
      return {
        ...state,
        groupList: state.groupList.filter((i) =>
          (payload as ActionTypeMap['deleteGroups']).every(
            (j) => j !== i.teamId
          )
        ),
      }
    case 'setFriends':
      return {
        ...state,
        friendList: payload as ActionTypeMap['setFriends'],
      }
    case 'updateFriends':
      return {
        ...state,
        friendList: mergeArrs<NimKitCoreTypes.IFriendInfo>(
          state.friendList,
          payload as ActionTypeMap['updateFriends'],
          'account'
        ),
      }
    case 'deleteFriends':
      return {
        ...state,
        friendList: state.friendList.filter((i) =>
          (payload as ActionTypeMap['deleteFriends']).every(
            (j) => j !== i.account
          )
        ),
      }
    case 'selectContactType':
      return {
        ...state,
        selectedContactType: payload as ActionTypeMap['selectContactType'],
      }
    case 'insertTempSession': {
      const { isSelected, session } =
        payload as ActionTypeMap['insertTempSession']
      // 这里统一把临时 session 加上 lastMsg
      const _session: NimKitCoreTypes.ISession = {
        ...session,
        lastMsg: session.lastMsg || ({} as any),
      }
      const newSessions = mergeArrs<NimKitCoreTypes.ISession>(
        state.sessions,
        [_session],
        'id'
      )
      return {
        ...state,
        sessions: newSessions,
        selectedSession: isSelected
          ? newSessions.find((item) => item.id === _session.id)
          : newSessions.find((item) => item.id === state.selectedSession?.id),
      }
    }

    case 'updateMyUserInfo': {
      return {
        ...state,
        myUserInfo: {
          ...state.myUserInfo,
          ...(payload as UserNameCard),
        },
      }
    }
    default:
      return state
  }
}
