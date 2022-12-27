import { useContext } from 'react'
import { Context, ContextProps } from '../contextManager/Provider'

export const useStateContext = (): Required<
  Pick<ContextProps, 'nim' | 'store' | 'initOptions' | 'localOptions'>
> => {
  const { store, nim, initOptions, localOptions } =
    useContext<ContextProps>(Context)

  if (!nim || !store || !initOptions || !localOptions) {
    throw new Error('Please use Provider to wrap UI Kit.')
  }

  return { nim, store, initOptions, localOptions }
}
