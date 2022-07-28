import { useContext } from 'react'
import { ChatContext } from '../contextManager/Provider'
import { State } from '../contextManager/actionTypes'

export const useStateContext = (): Record<'chatState', State> => {
  const { chatState } = useContext(ChatContext)
  if (!chatState) {
    throw new Error('Please use ChatProvider to wrap ChatKit.')
  }

  return {
    chatState,
  }
}
