import { useContext } from 'react'
import { Context, ContextProps } from '../contextManager/Provider'

export const useTranslation = (): Required<Pick<ContextProps, 't'>> => {
  const { t } = useContext<ContextProps>(Context)

  if (!t) {
    throw new Error('Please use Provider to wrap UI Kit.')
  }

  return { t }
}
