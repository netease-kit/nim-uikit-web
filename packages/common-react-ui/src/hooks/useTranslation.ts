import { useContext } from 'react'
import { Context, ContextProps } from '../contextManager'

export const useTranslation = (): Required<Pick<ContextProps, 't'>> => {
  const { t } = useContext(Context)

  if (!t) {
    throw new Error('Please use Provider to wrap useTranslation.')
  }

  return { t }
}
