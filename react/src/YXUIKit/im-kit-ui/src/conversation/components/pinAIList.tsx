import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { useStateContext } from '../../common'
import { PinAIItem } from './pinAIItem'

export interface PinAIListProps {
  prefix?: string
  commonPrefix?: string
}

export const PinAIList: FC<PinAIListProps> = observer(
  ({ prefix = 'conversation', commonPrefix = 'common' }) => {
    const _prefix = `${prefix}-ai-list`

    const { store } = useStateContext()

    const aiUsers = store.aiUserStore.getAIPinUser()

    return aiUsers.length ? (
      <div className={_prefix}>
        {aiUsers.map((aiUser) => (
          <PinAIItem
            key={aiUser.accountId}
            aiUser={aiUser}
            prefix={prefix}
            commonPrefix={commonPrefix}
          />
        ))}
      </div>
    ) : null
  }
)
