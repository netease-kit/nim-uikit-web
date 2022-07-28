import React from 'react'
import { ComponentMeta } from '@storybook/react'
import SearchModal from './index'

import '../../style'

export default {
  title: 'search-kit/SearchModal',
  component: SearchModal,
} as ComponentMeta<typeof SearchModal>

export const Primary = () => {
  return <SearchModal visible />
}
