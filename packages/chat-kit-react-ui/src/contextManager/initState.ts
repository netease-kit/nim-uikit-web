import { State } from './actionTypes'
import { ITeamInfo } from '../types'

const ChatState: State = {
  messages: [],
  memberList: [],
  managers: [],
  muted: false,
  teamInfo: {} as ITeamInfo,
  msgNoData: false,
  msgLoading: false,
  notExitTeamAccounts: [],
  notExitTeamAccountsInfo: [],
  uploadImageLoading: false,
  uploadFileLoading: false,
}
export default ChatState
