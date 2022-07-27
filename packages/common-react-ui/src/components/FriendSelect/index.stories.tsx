import React, { useState } from 'react'
import { FriendSelectContainer } from './Container'
import { Provider } from '../../contextManager'
import { ComponentStory } from '@storybook/react'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

import './style'

export default {
  title: 'common/FriendSelect',
}

const Template: ComponentStory<typeof FriendSelectContainer> = (args) => {
  const [selectedList, setSelectedList] = useState<
    NimKitCoreTypes.IFriendInfo[]
  >([])

  return (
    <Provider>
      <div style={{ width: 420, height: 310, border: '1px solid #333' }}>
        <FriendSelectContainer
          {...args}
          onSelect={(list) => {
            console.log('onSelect: ', list)
            setSelectedList(list)
          }}
          selectedAccounts={selectedList.map((item) => item.account)}
        />
      </div>
    </Provider>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  prefix: 'common',
  max: 10,
}
