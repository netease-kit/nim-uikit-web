import { useContext } from 'react'
import { Context, ContextProps } from '../contextManager/Provider'

export const useStateContext = (): Required<
  Pick<ContextProps, 'nim' | 'store' | 'initOptions'>
> => {
  const { store, nim, initOptions } = useContext<ContextProps>(Context)

  if (!nim || !store || !initOptions) {
    throw new Error('Please use Provider to wrap UI Kit.')
  }

  return { nim, store, initOptions }
}
