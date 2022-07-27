import React, { createContext, Dispatch, useReducer } from 'react'
import { State, ActionProps, ActionTypeMap } from './actionTypes'

import chatStore from './initState'
import chatReducer from './reducer'

export const ChatContext = createContext<{
  chatState?: State
  chatDispatch?: Dispatch<ActionProps<ActionTypeMap>>
}>({})

interface IChatProviderProps {
  children: React.ReactNode
  chatState?: State
  chatDispatch?: Dispatch<ActionProps<ActionTypeMap>>
}

export const ChatProvider: React.FC<IChatProviderProps> = ({ children }) => {
  //@ts-ignore
  const [chatState, chatDispatch] = useReducer(chatReducer, chatStore)
  return (
    <ChatContext.Provider
      value={{
        chatState,
        chatDispatch,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
