import { useEffect } from 'react'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { ContextManagerTypes } from '@xkit-yx/common-ui'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import * as ActionTypes from '../contextManager/actionTypes'
import { logger } from '../logger'
interface IProps {
  nim: NimKitCoreTypes.INimKitCore
  selectedSession: NimKitCoreTypes.ISession | undefined
  chatState: ActionTypes.State
  chatDispatch: React.Dispatch<
    ActionTypes.ActionProps<ActionTypes.ActionTypeMap>
  >
  dispatch: ContextManagerTypes.IDispatch
  initOptions: NIMInitializeOptions
}

function useMemberListInfo({
  nim,
  selectedSession,
  chatDispatch,
  dispatch,
  initOptions,
}: IProps) {
  useEffect(() => {
    if (!selectedSession) {
      return
    }
    const { scene } = selectedSession

    if (scene === 'team') {
      const { teamId } = selectedSession as NimKitCoreTypes.TeamSession
      nim
        .getTeamMemberListInfo({
          teamId,
        })
        .then((members: NimKitCoreTypes.ITeamMemberInfo[]) => {
          logger.log('获取群成员信息成功')
          chatDispatch({
            type: ActionTypes.CLEAR_MEMBERS_LIST,
            payload: undefined,
          })
          chatDispatch({
            type: ActionTypes.ADD_MEMBERS_LIST,
            payload: members,
          })
        })
        .catch((error) => {
          logger.error('获取群成员信息失败', error)
        })
      return
    }

    const { to } = selectedSession as NimKitCoreTypes.P2PSession
    nim
      .getUsersNameCardFromServer({
        accounts: [to, initOptions.account],
      })
      .then((members) => {
        logger.log('获取单聊成员信息成功')
        chatDispatch({
          type: ActionTypes.CLEAR_MEMBERS_LIST,
          payload: undefined,
        })
        chatDispatch({
          type: ActionTypes.ADD_MEMBERS_LIST,
          payload: members,
        })
        dispatch({
          type: 'updateMyUserInfo',
          payload: members[1],
        })
      })
      .catch((error) => {
        logger.error('获取单聊成员信息失败', error)
      })
  }, [
    (selectedSession as NimKitCoreTypes.TeamSession)?.teamId,
    (selectedSession as NimKitCoreTypes.ISession)?.id,
    nim,
    initOptions.account,
    chatDispatch,
  ])
}

export default useMemberListInfo
