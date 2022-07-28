import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { ITeamInfo, IMessage } from '../types'

export interface State {
  messages: IMessage[]
  memberList: NimKitCoreTypes.ITeamMemberInfo[]
  managers: string[]
  muted: boolean
  teamInfo: ITeamInfo
  msgNoData: boolean
  msgLoading: boolean
  notExitTeamAccounts: string[]
  notExitTeamAccountsInfo: UserNameCard[]
  uploadImageLoading: boolean
  uploadFileLoading: boolean
}

export const ADD_MESSAGES = 'ADD_MESSAGES'
export const UPDATE_MESSAGES = 'UPDATE_MESSAGES'
export const DELETE_MESSAGES = 'DELETE_MESSAGES'
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES'
export const ADD_HISTORY_MESSAGES = 'ADD_HISTORY_MESSAGES'

export const ADD_MEMBERS_LIST = 'ADD_MEMBERS_LIST'
export const UPDATE_MEMBERS_LIST = 'UPDATE_MEMBERS_LIST'
export const DELETE_MEMBERS_LIST = 'DELETE_MEMBERS_LIST'
export const CLEAR_MEMBERS_LIST = 'CLEAR_MEMBERS_LIST'

export const ADD_TEAM_MANAGERS = 'ADD_TEAM_MANAGERS'
export const DELETE_TEAM_MANAGERS = 'DELETE_TEAM_MANAGERS'

export const UPDATE_MSG_NO_DATA = 'UPDATE_MSG_NO_DATA'
export const UPDATE_MSG_LOADING = 'UPDATE_MSG_LOADING'

export const UPDATE_SELECTED_GROUP_INFO = 'UPDATE_SELECTED_GROUP_INFO'
export const CLEAR_SELECTED_GROUP_INFO = 'CLEAR_SELECTED_GROUP_INFO'

export const UPDATE_NOT_EXIT_TEAM_ACCOUNTS = 'UPDATE_NOT_EXIT_TEAM_ACCOUNTS'

export const UPDATE_NOT_EXIT_TEAM_ACCOUNTS_INFO =
  'UPDATE_NOT_EXIT_TEAM_ACCOUNTS_INFO'

export const UPDATE_UPLOAD_IMAGE_LOADING = 'UPDATE_UPLOAD_IMAGE_LOADING'
export const UPDATE_UPLOAD_FILE_LOADING = 'UPDATE_UPLOAD_FILE_LOADING'

export interface ActionTypeMap {
  [ADD_MESSAGES]: IMessage[]
  [ADD_HISTORY_MESSAGES]: IMessage[]
  [DELETE_MESSAGES]: string[]
  [UPDATE_MESSAGES]: IMessage
  [CLEAR_MESSAGES]: undefined

  [ADD_MEMBERS_LIST]: Partial<NimKitCoreTypes.ITeamMemberInfo>[]
  [UPDATE_MEMBERS_LIST]: Partial<NimKitCoreTypes.ITeamMemberInfo>
  [DELETE_MEMBERS_LIST]: string[]
  [CLEAR_MEMBERS_LIST]: undefined

  [ADD_TEAM_MANAGERS]: string[]
  [DELETE_TEAM_MANAGERS]: string[]

  [UPDATE_SELECTED_GROUP_INFO]: ITeamInfo
  [CLEAR_SELECTED_GROUP_INFO]: Partial<ITeamInfo>

  [UPDATE_MSG_NO_DATA]: boolean
  [UPDATE_MSG_LOADING]: boolean

  [UPDATE_NOT_EXIT_TEAM_ACCOUNTS]: string[]

  [UPDATE_NOT_EXIT_TEAM_ACCOUNTS_INFO]: UserNameCard[]

  [UPDATE_UPLOAD_IMAGE_LOADING]: boolean
  [UPDATE_UPLOAD_FILE_LOADING]: boolean
}

export type ActionProps<T> = {
  [P in keyof T]: {
    type: P
    payload: T[P]
  }
}[keyof T]
