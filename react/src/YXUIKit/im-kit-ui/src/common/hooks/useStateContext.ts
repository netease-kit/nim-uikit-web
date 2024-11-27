import { useContext } from 'react'
import { Context, ContextProps } from '../contextManager/Provider'

export const useStateContext = (): Required<
  Pick<ContextProps, 'nim' | 'store' | 'localOptions'>
> => {
  const { store, nim, localOptions } = useContext<ContextProps>(Context)

  if (!nim || !store || !localOptions) {
    throw new Error('Please use Provider to wrap UI Kit.')
  }

  return { nim, store, localOptions }
}
