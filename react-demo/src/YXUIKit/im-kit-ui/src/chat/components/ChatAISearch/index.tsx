import { Drawer, Input, message } from 'antd'
import { observer } from 'mobx-react'
import React, { FC, useState } from 'react'
import { useStateContext, useTranslation } from '../../../common'
import { LoadingOutlined } from '@ant-design/icons'
import { V2NIMAIModelRoleType } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService'
import { getAIErrorMap } from '../../../utils'

export interface ChatAISearchProps {
  prefix?: string
}

export const ChatAISearch: FC<ChatAISearchProps> = observer(
  ({ prefix = 'chat' }) => {
    const _prefix = `${prefix}-ai-search`

    const { store } = useStateContext()
    const { t } = useTranslation()

    const aiErrorMap = getAIErrorMap(t)

    const [inputValue, setInputValue] = useState('')

    const title = store.aiUserStore.aiProxying ? (
      <div className={`${_prefix}-title`}>
        <LoadingOutlined style={{ color: '#1861df' }} />
        <span style={{ marginLeft: '5px' }}>{t('aiSearchingText')}</span>
      </div>
    ) : (
      <div>{t('aiSearchText')}</div>
    )

    const onInputChangeHandler = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      setInputValue(e.target.value)
    }

    const onPressEnterHandler = (
      e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      const trimValue = inputValue.trim()

      if (!e.shiftKey) {
        e.preventDefault()
        if (!trimValue) {
          message.warning(t('sendEmptyText'))
          return
        }

        const aiSearchUser = store.aiUserStore.getAISearchUser()

        if (aiSearchUser) {
          store.aiUserStore
            .sendAIProxyActive({
              accountId: aiSearchUser.accountId,
              content: { msg: trimValue, type: 0 },
              messages: store.aiUserStore.aiReqMsgs.map((item) => ({
                role: 'user' as V2NIMAIModelRoleType,
                ...item,
              })),
              onSendAIProxyErrorHandler: (code: number) => {
                const errorText = aiErrorMap[code] || t('aiProxyFailedText')

                message.error(errorText)
              },
            })
            .catch(() => {
              //
            })
        }

        setInputValue('')
      }
    }

    const onCloseHandler = () => {
      store.aiUserStore.resetAIProxy()
    }

    return (
      <Drawer
        mask={false}
        maskClosable={false}
        placement="bottom"
        open={store.aiUserStore.isAISearching()}
        closable={true}
        getContainer={false}
        title={title}
        onClose={onCloseHandler}
        keyboard={false}
        className={_prefix}
      >
        <div className={`${_prefix}-content`}>
          <Input.TextArea
            placeholder={t('aiSearchInputPlaceholder')}
            bordered={true}
            className={`${_prefix}-textarea`}
            value={inputValue}
            onChange={onInputChangeHandler}
            onPressEnter={onPressEnterHandler}
            autoSize={{ maxRows: 3 }}
          />
          <div className={`${_prefix}-tip`}>{t('searchTipText')}</div>
          <div className={`${_prefix}-list`}>
            {store.aiUserStore.aiResMsgs
              .slice()
              .reverse()
              .map((item, index) => (
                <div key={`${item}_${index}`} className={`${_prefix}-item`}>
                  {item}
                </div>
              ))}
          </div>
        </div>
      </Drawer>
    )
  }
)
