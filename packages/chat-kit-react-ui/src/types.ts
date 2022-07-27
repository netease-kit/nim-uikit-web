import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import type { UploadFile } from 'antd/es/upload/interface'

export interface ISendProps {
  from: string
  type: string
  body?: string
  to: string
  scene: 'p2p' | 'team' | 'superTeam'
  file?: UploadFile
}

export type ITeamInfo = NimKitCoreTypes.ITeamMemberInfo & Team

export interface ICustomMessageInfo {
  from?: string
  body?: string
  type?: ['type']
  specialType: 'recall' | 'reedit'
  idClient: string
  fromNick?: string
  timer?: number | null
}

export type IMMessageInfo = IMMessage &
  Partial<UserNameCard> & {
    showRecall?: boolean | undefined
    showRecallTimer?: number | null
  }

export type IMessage = IMMessageInfo | ICustomMessageInfo
