import { useContext } from 'react'
import { Context, ContextProps } from '../contextManager'

export const useStateContext = (): Required<
  Pick<ContextProps, 'state' | 'nim' | 'initOptions'>
> => {
  const { nim, state, initOptions } = useContext(Context)

  if (!nim || !state || !initOptions) {
    throw new Error('Please use Provider to wrap useStateContext.')
  }

  return { nim, state, initOptions }
}
