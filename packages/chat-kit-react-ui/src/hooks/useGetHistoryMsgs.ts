import { useCallback } from 'react'
import { IMMessageInfo } from '../types'
import { SCROLL_MSG_TYPE } from '../constant'
import { GetHistoryMsgsOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgLogServiceInterface'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

function useGetHistoryMsgs(
  { currentSession, setScrollMsgType, teamId },
  { nim, chatDispatch, ActionTypes }
) {
  return useCallback(
    async (finMsg?: IMMessageInfo) => {
      if (!currentSession) {
        return
      }
      setScrollMsgType(SCROLL_MSG_TYPE.history)

      const { scene, to } = currentSession as NimKitCoreTypes.P2PSession

      const params: GetHistoryMsgsOptions = {
        scene,
        to: scene === 'p2p' ? to : teamId,
        beginTime: 0,
        endTime: (finMsg as IMMessageInfo)?.time || Date.now(),
        reverse: false,
      }
      if (finMsg?.idServer) {
        params.lastMsgId = finMsg.idServer
      }
      try {
        chatDispatch({
          type: ActionTypes.UPDATE_MSG_LOADING,
          payload: true,
        })
        const list = await nim.getHistoryMsgs(params)
        chatDispatch({
          type: ActionTypes.UPDATE_MSG_LOADING,
          payload: false,
        })
        const msgList = list
          .filter((item) => item.type !== 'notification')
          .reverse()
        if (!msgList.length && finMsg?.idServer) {
          return chatDispatch({
            type: ActionTypes.UPDATE_MSG_NO_DATA,
            payload: true,
          })
        }
        chatDispatch({
          type: ActionTypes.ADD_HISTORY_MESSAGES,
          payload: msgList,
        })
      } catch (error) {
        chatDispatch({
          type: ActionTypes.UPDATE_MSG_LOADING,
          payload: false,
        })
      }
    },
    [currentSession?.id, chatDispatch, nim, teamId]
  )
}

export default useGetHistoryMsgs
