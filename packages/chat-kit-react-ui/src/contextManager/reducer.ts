import { Utils } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import * as ActionTypes from './actionTypes'
import { IMessage, ITeamInfo } from '../types'
const { mergeArrs } = Utils

const reducer = (
  state: ActionTypes.State,
  action: ActionTypes.ActionProps<ActionTypes.ActionTypeMap>
): ActionTypes.State => {
  const { type, payload } = action

  switch (type) {
    case ActionTypes.ADD_MESSAGES:
      return {
        ...state,
        messages: mergeArrs<IMessage>(
          state.messages,
          payload as ActionTypes.ActionTypeMap['ADD_MESSAGES'],
          'idClient'
        ),
      }
    case ActionTypes.ADD_HISTORY_MESSAGES: {
      const messages = [...state.messages]
      const payloadArrs =
        payload as ActionTypes.ActionTypeMap['ADD_HISTORY_MESSAGES']
      messages.unshift(...payloadArrs)
      return {
        ...state,
        messages: mergeArrs<IMessage>(messages, payloadArrs, 'idClient'),
      }
    }
    case ActionTypes.UPDATE_MESSAGES: {
      const { idClient } =
        payload as ActionTypes.ActionTypeMap['UPDATE_MESSAGES']
      const messages = [...state.messages].map((item) =>
        item.idClient === idClient
          ? {
              ...item,
              ...(payload as ActionTypes.ActionTypeMap['UPDATE_MESSAGES']),
            }
          : item
      )
      return {
        ...state,
        messages,
      }
    }
    case ActionTypes.DELETE_MESSAGES: {
      return {
        ...state,
        messages: state.messages.filter((item) => {
          return !(
            payload as ActionTypes.ActionTypeMap['DELETE_MESSAGES']
          ).some((idClient) => idClient === item.idClient)
        }),
      }
    }
    case ActionTypes.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
      }

    case ActionTypes.ADD_MEMBERS_LIST: {
      return {
        ...state,
        memberList: mergeArrs<NimKitCoreTypes.ITeamMemberInfo>(
          state.memberList,
          payload as ActionTypes.ActionTypeMap['ADD_MEMBERS_LIST'],
          'account'
        ),
      }
    }
    case ActionTypes.UPDATE_MEMBERS_LIST: {
      const { account } =
        payload as ActionTypes.ActionTypeMap['UPDATE_MEMBERS_LIST']
      const memberList = [...state.memberList].map((item) =>
        item.account === account
          ? {
              ...item,
              ...(payload as ActionTypes.ActionTypeMap['UPDATE_MEMBERS_LIST']),
            }
          : item
      )
      return {
        ...state,
        memberList,
      }
    }
    case ActionTypes.DELETE_MEMBERS_LIST: {
      return {
        ...state,
        memberList: state.memberList.filter(
          (item) =>
            !(
              payload as ActionTypes.ActionTypeMap['DELETE_MEMBERS_LIST']
            ).includes(item.account)
        ),
      }
    }
    case ActionTypes.CLEAR_MEMBERS_LIST: {
      return {
        ...state,
        memberList: [],
      }
    }

    case ActionTypes.ADD_TEAM_MANAGERS: {
      return {
        ...state,
        managers: state.managers.concat(
          payload as ActionTypes.ActionTypeMap['ADD_TEAM_MANAGERS']
        ),
      }
    }

    case ActionTypes.UPDATE_SELECTED_GROUP_INFO: {
      return {
        ...state,
        teamInfo: {
          ...state.teamInfo,
          ...(payload as ActionTypes.ActionTypeMap['UPDATE_SELECTED_GROUP_INFO']),
        },
      }
    }
    case ActionTypes.CLEAR_SELECTED_GROUP_INFO: {
      return {
        ...state,
        teamInfo: {} as ITeamInfo,
      }
    }

    case ActionTypes.UPDATE_MSG_NO_DATA: {
      return {
        ...state,
        msgNoData: payload,
      }
    }
    case ActionTypes.UPDATE_MSG_LOADING: {
      return {
        ...state,
        msgLoading: payload,
      }
    }

    case ActionTypes.UPDATE_NOT_EXIT_TEAM_ACCOUNTS: {
      return {
        ...state,
        notExitTeamAccounts: Array.from(
          new Set(
            payload as ActionTypes.ActionTypeMap['UPDATE_NOT_EXIT_TEAM_ACCOUNTS']
          )
        ),
      }
    }

    case ActionTypes.UPDATE_NOT_EXIT_TEAM_ACCOUNTS_INFO: {
      return {
        ...state,
        notExitTeamAccountsInfo:
          payload as ActionTypes.ActionTypeMap['UPDATE_NOT_EXIT_TEAM_ACCOUNTS_INFO'],
      }
    }

    case ActionTypes.UPDATE_UPLOAD_IMAGE_LOADING: {
      return {
        ...state,
        uploadImageLoading:
          payload as ActionTypes.ActionTypeMap['UPDATE_UPLOAD_IMAGE_LOADING'],
      }
    }

    case ActionTypes.UPDATE_UPLOAD_FILE_LOADING: {
      return {
        ...state,
        uploadFileLoading:
          payload as ActionTypes.ActionTypeMap['UPDATE_UPLOAD_FILE_LOADING'],
      }
    }
    default:
      return state
  }
}

export default reducer
