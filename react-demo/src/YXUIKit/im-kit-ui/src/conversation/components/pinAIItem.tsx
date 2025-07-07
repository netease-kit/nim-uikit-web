import { observer } from 'mobx-react'
import React, { FC } from 'react'
import {
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../common'
import { V2NIMAIUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService'
import { message } from 'antd'
import { logger } from '../../utils'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

export interface PinAIItemProps {
  aiUser: V2NIMAIUser

  prefix?: string
  commonPrefix?: string
}

export const PinAIItem: FC<PinAIItemProps> = observer(
  ({ aiUser, prefix = 'conversation', commonPrefix = 'common' }) => {
    const _prefix = `${prefix}-ai-item`

    const { store } = useStateContext()

    const { t } = useTranslation()

    const handleItemClick = () => {
      if (store.sdkOptions?.enableV2CloudConversation) {
        store.conversationStore
          ?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
            aiUser.accountId,
            true
          )
          .catch((err) => {
            message.error(t('aiConversationSelectFailed'))
            logger.error(err)
          })
      } else {
        store.localConversationStore
          ?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
            aiUser.accountId,
            true
          )
          .catch((err) => {
            message.error(t('aiConversationSelectFailed'))
            logger.error(err)
          })
      }
    }

    return (
      <div className={_prefix} onClick={() => handleItemClick()}>
        <ComplexAvatarContainer
          account={aiUser.accountId}
          prefix={commonPrefix}
          onMessageItemAvatarClick={() => handleItemClick()}
        />
        <span onClick={() => handleItemClick()} className={`${_prefix}-name`}>
          {store.uiStore.getAppellation({
            account: aiUser.accountId,
          })}
        </span>
      </div>
    )
  }
)
