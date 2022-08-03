import { useCallback } from 'react'
import { IBaseUploadFileOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/types'
import { ISendProps, IMMessageInfo } from '../types'
import { SCROLL_MSG_TYPE, SHOW_RECALL_BTN_MSG_TIME } from '../constant'

function useSendMessageCallback(
  { setScrollMsgType, setInputValue },
  { nim, chatDispatch, ActionTypes }
) {
  const getRecallBtnMsgInfo = useCallback((msg) => {
    const finMsg: IMMessageInfo = {
      ...msg,
      showRecall: true,
    }
    setTimeout(() => {
      finMsg.showRecall = false
      chatDispatch({
        type: ActionTypes.UPDATE_MESSAGES,
        payload: finMsg,
      })
    }, SHOW_RECALL_BTN_MSG_TIME)
    return finMsg
  }, [])

  const onSendHandler = useCallback(
    ({ type, body = '', to, scene, file }: ISendProps) => {
      setInputValue('')
      setScrollMsgType(SCROLL_MSG_TYPE.send)
      switch (type) {
        case 'text':
          nim
            .sendTextMsg({
              body,
              scene,
              to,
              onSendBefore: (msg) => {
                chatDispatch({
                  type: ActionTypes.ADD_MESSAGES,
                  payload: [msg],
                })
              },
            })
            .then((textMsg) => {
              const finMsg = getRecallBtnMsgInfo(textMsg)
              chatDispatch({
                type: ActionTypes.UPDATE_MESSAGES,
                payload: finMsg,
              })
            })
            .catch((error) => {
              chatDispatch({
                type: ActionTypes.UPDATE_MESSAGES,
                payload: error.msg,
              })
            })
          break
        case 'image':
          nim
            .sendImageMsg({
              scene,
              to,
              file: file as IBaseUploadFileOptions['file'],
              onUploadStart() {
                chatDispatch({
                  type: ActionTypes.UPDATE_UPLOAD_IMAGE_LOADING,
                  payload: true,
                })
              },
              onUploadDone() {
                chatDispatch({
                  type: ActionTypes.UPDATE_UPLOAD_IMAGE_LOADING,
                  payload: false,
                })
              },
              onSendBefore: (msg) => {
                chatDispatch({
                  type: ActionTypes.ADD_MESSAGES,
                  payload: [msg],
                })
              },
            })
            .then((imageMsg) => {
              const finMsg = getRecallBtnMsgInfo(imageMsg)
              chatDispatch({
                type: ActionTypes.UPDATE_MESSAGES,
                payload: finMsg,
              })
            })
            .catch((error) => {
              chatDispatch({
                type: ActionTypes.UPDATE_MESSAGES,
                payload: error.msg,
              })
            })
          break
        case 'file':
          nim
            .sendFileMsg({
              scene,
              to,
              file: file as IBaseUploadFileOptions['file'],
              onUploadStart() {
                chatDispatch({
                  type: ActionTypes.UPDATE_UPLOAD_FILE_LOADING,
                  payload: true,
                })
              },
              onUploadDone() {
                chatDispatch({
                  type: ActionTypes.UPDATE_UPLOAD_FILE_LOADING,
                  payload: false,
                })
              },
              onSendBefore: (msg) => {
                chatDispatch({
                  type: ActionTypes.ADD_MESSAGES,
                  payload: [msg],
                })
              },
            })
            .then((fileMsg) => {
              const finMsg = getRecallBtnMsgInfo(fileMsg)
              chatDispatch({
                type: ActionTypes.UPDATE_MESSAGES,
                payload: finMsg,
              })
            })
            .catch((error) => {
              chatDispatch({
                type: ActionTypes.UPDATE_MESSAGES,
                payload: error.msg,
              })
            })
          break
        case 'custom':
          nim
            .sendCustomMsg({
              scene,
              to,
              body,
              attach: body,
              onSendBefore: async (msg) => {
                chatDispatch({
                  type: ActionTypes.ADD_MESSAGES,
                  payload: [msg],
                })
              },
            })
            .then((customMsg) => {
              const finMsg = getRecallBtnMsgInfo(customMsg)
              chatDispatch({
                type: ActionTypes.UPDATE_MESSAGES,
                payload: finMsg,
              })
            })
            .catch((error) => {
              chatDispatch({
                type: ActionTypes.UPDATE_MESSAGES,
                payload: error.msg,
              })
            })
          break
        default:
          return
      }
    },
    []
  )

  const onResendHandler = useCallback((msg) => {
    setScrollMsgType(SCROLL_MSG_TYPE.resend)
    chatDispatch({
      type: ActionTypes.UPDATE_MESSAGES,
      payload: {
        ...msg,
        status: 'sending',
      } as IMMessageInfo,
    })
    nim
      .resendMsg({
        msg,
      })
      .then((newMsg) => {
        const finMsg = getRecallBtnMsgInfo(newMsg)
        chatDispatch({
          type: ActionTypes.UPDATE_MESSAGES,
          payload: finMsg,
        })
      })
      .catch((error) => {
        chatDispatch({
          type: ActionTypes.UPDATE_MESSAGES,
          payload: error.msg,
        })
      })
  }, [])

  return {
    onSendHandler,
    onResendHandler,
  }
}

export default useSendMessageCallback
