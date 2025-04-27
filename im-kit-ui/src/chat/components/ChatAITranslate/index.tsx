import { observer } from 'mobx-react'
import React, { FC, useEffect, useState } from 'react'
import { useStateContext, useTranslation } from '../../../common'
import { Select, Button, message } from 'antd'
import {
  ArrowDownOutlined,
  CloseOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { getAIErrorMap, logger } from '../../../utils'
import { V2NIMError } from 'nim-web-sdk-ng/dist/esm/nim/src/types'

export interface ChatAITranslateProps {
  inputValue: string
  setInputValue: (value: string) => void
  onClose: () => void
  visible: boolean

  prefix?: string
}

const defaultLangs = ['英语', '日语', '韩语', '俄语', '法语', '德语']

export const ChatAITranslate: FC<ChatAITranslateProps> = observer(
  ({ inputValue, setInputValue, onClose, visible, prefix = 'chat' }) => {
    const _prefix = `${prefix}-ai-translate`

    const { store, localOptions } = useStateContext()
    const { t } = useTranslation()

    const aiErrorMap = getAIErrorMap(t)

    const options = (
      store.aiUserStore.getAITranslateLangs().length
        ? store.aiUserStore.getAITranslateLangs()
        : defaultLangs
    ).map((lang) => ({
      label: lang,
      value: lang,
    }))

    const resonpse = store.aiUserStore.isAITranslating()
      ? store.aiUserStore.aiResMsgs[0]
      : ''

    const [selectedLang, setSelectedLang] = useState(options[0]?.value || '')

    const resetState = () => {
      setSelectedLang(options[0]?.value || '')
    }

    useEffect(() => {
      resetState()
      store.aiUserStore.resetAIProxy()
    }, [visible, store.aiUserStore])

    useEffect(() => {
      store.aiUserStore.resetAIProxy()
    }, [inputValue, store.aiUserStore, selectedLang])

    const onUseTranslateHandler = () => {
      setInputValue(resonpse)
    }

    const onTranslateHandler = async () => {
      if (!inputValue) {
        message.warning(t('aiTranslateEmptyText'))
        return
      }

      const aiTranslateUser = store.aiUserStore.getAITranslateUser()

      if (aiTranslateUser) {
        try {
          await store.aiUserStore.sendAIProxyActive({
            accountId: aiTranslateUser.accountId,
            requestId: Math.random().toString(36).slice(2),
            content: { msg: inputValue, type: 0 },
            promptVariables: JSON.stringify({ Language: selectedLang }),
            onSendAIProxyErrorHandler: (code: number) => {
              const errorText = aiErrorMap[code] || t('aiProxyFailedText')

              message.error(errorText)
            },
            aiStream: localOptions.aiStream as boolean,
          })
        } catch (error) {
          logger.error('AI 翻译失败', (error as V2NIMError).toString())
        }
      }
    }

    const renderBtn = () => {
      return store.aiUserStore.aiProxying ? (
        <div className={`${_prefix}-btn`}>
          <LoadingOutlined />
          <span style={{ marginLeft: '5px' }}>{t('aiTranslatingText')}</span>
        </div>
      ) : resonpse ? (
        <Button
          type="link"
          className={`${_prefix}-btn`}
          onClick={onUseTranslateHandler}
        >
          <span>{t('aiTranslatedText')}</span>
          <ArrowDownOutlined style={{ fontSize: 12 }} />
        </Button>
      ) : (
        <Button
          type="link"
          className={`${_prefix}-btn`}
          onClick={onTranslateHandler}
        >
          {t('aiTranslateText')}
        </Button>
      )
    }

    return visible ? (
      <div className={_prefix}>
        <Select
          options={options}
          value={selectedLang}
          onSelect={setSelectedLang}
          className={`${_prefix}-select`}
          showArrow={false}
          dropdownMatchSelectWidth={120}
        />
        <div className={`${_prefix}-content`}>
          {resonpse ? (
            resonpse
          ) : (
            <span className={`${_prefix}-tip`}>
              {t('aiTranslatePlaceholder')}
            </span>
          )}
        </div>
        {renderBtn()}
        <Button
          type="text"
          icon={<CloseOutlined style={{ fontSize: 12 }} />}
          onClick={onClose}
        ></Button>
      </div>
    ) : null
  }
)
