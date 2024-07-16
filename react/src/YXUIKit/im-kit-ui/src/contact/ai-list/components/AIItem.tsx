import React, { FC } from 'react'
import { ComplexAvatarContainer, useStateContext } from '../../../common'
import { observer } from 'mobx-react'
import { V2NIMAIUser } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMAIService'

export interface AIItemProps {
  aiUser: V2NIMAIUser
  onItemClick?: (aiUser: V2NIMAIUser) => void
  afterSendMsgClick?: () => void
  prefix?: string
  commonPrefix?: string
}

export const AIItem: FC<AIItemProps> = observer(
  ({
    aiUser,
    onItemClick,
    afterSendMsgClick,
    prefix = 'contact',
    commonPrefix = 'common',
  }) => {
    const _prefix = `${prefix}-ai-item`

    const { store } = useStateContext()

    return (
      <div
        className={_prefix}
        onClick={(e) => {
          e.stopPropagation()
          onItemClick?.(aiUser)
        }}
      >
        <ComplexAvatarContainer
          account={aiUser.accountId}
          prefix={commonPrefix}
          afterSendMsgClick={afterSendMsgClick}
        />
        <span className={`${_prefix}-label`}>
          {store.uiStore.getAppellation({
            account: aiUser.accountId,
          })}
        </span>
      </div>
    )
  }
)
