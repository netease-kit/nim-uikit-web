import React from 'react'
import { Provider } from '../..'
import { ComponentMeta } from '@storybook/react'
import SearchInput from './index'
import './style'

export default {
  title: 'common/SearchInput',
  component: SearchInput,
} as ComponentMeta<typeof SearchInput>

export const Primary = () => {
  return (
    <Provider>
      <SearchInput />
    </Provider>
  )
}

export const Disabled = () => {
  return (
    <Provider>
      <SearchInput disabled />
    </Provider>
  )
}
