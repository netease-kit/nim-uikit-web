import { Button, message, Modal } from 'antd'
import {
  SearchInput,
  useTranslation,
  useStateContext,
} from '../../../../common'
import React, { useState } from 'react'
import { CrudeAvatar } from '../../../../common'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { observer } from 'mobx-react'

export interface AddFriendModalProps {
  visible: boolean
  onCancel: () => void
  onChat: (account: string) => void
  prefix?: string
  commonPrefix?: string
}

const AddFriendModal: React.FC<AddFriendModalProps> = observer(
  ({
    visible,
    onCancel,
    onChat,
    prefix = 'search',
    commonPrefix = 'common',
  }) => {
    const _prefix = `${prefix}-add-modal`

    const { store, localOptions } = useStateContext()

    const { t } = useTranslation()

    const [searchValue, setSearchValue] = useState('')
    const [searchRes, setSearchRes] = useState<
      (UserNameCard & { alias?: string }) | undefined
    >(undefined)
    const [searchResEmpty, setSearchResEmpty] = useState(false)
    const [searching, setSearching] = useState(false)
    const [adding, setAdding] = useState(false)

    const handleChange = (val: string) => {
      setSearchValue(val)
      setSearchResEmpty(false)
      setSearchRes(undefined)
    }

    const handleSearch = async () => {
      try {
        setSearching(true)
        const user = await store.userStore.getUserActive(searchValue)
        if (!user) {
          setSearchResEmpty(true)
        } else {
          setSearchRes(user)
        }
        setSearching(false)
      } catch (error) {
        setSearchResEmpty(true)
        setSearching(false)
      }
    }

    const handleAdd = async () => {
      try {
        if (searchRes) {
          setAdding(true)
          if (localOptions?.addFriendNeedVerify) {
            await store.friendStore.applyFriendActive(searchRes.account)
            message.success(t('applyFriendSuccessText'))
          } else {
            await store.friendStore.addFriendActive(searchRes.account)
            message.success(t('addFriendSuccessText'))
          }
        }
        setAdding(false)
      } catch (error) {
        setAdding(false)
      }
    }

    const handleChat = async () => {
      if (searchRes) {
        await store.sessionStore.insertSessionActive('p2p', searchRes.account)
        onChat(searchRes.account)
        resetState()
      }
    }

    const handleCancel = () => {
      onCancel()
      resetState()
    }

    const resetState = () => {
      setSearchValue('')
      setSearchRes(undefined)
      setSearchResEmpty(false)
      setSearching(false)
      setAdding(false)
    }

    const renderFooter = () => (
      <div className={`${_prefix}-footer`}>
        <Button onClick={handleCancel}>{t('cancelText')}</Button>
        <Button loading={searching} onClick={handleSearch} type="primary">
          {t('searchButtonText')}
        </Button>
      </div>
    )

    return (
      <Modal
        className={_prefix}
        title={t('addFriendText')}
        onCancel={handleCancel}
        visible={visible}
        width={460}
        footer={!searchRes ? renderFooter() : null}
      >
        <SearchInput
          placeholder={t('accountPlaceholder')}
          prefix={commonPrefix}
          onChange={handleChange}
          value={searchValue}
        />
        {searchResEmpty ? (
          <div className={`${_prefix}-empty-content`}>
            {t('accountNotMatchText')}
          </div>
        ) : searchRes ? (
          <div className={`${_prefix}-content`}>
            <CrudeAvatar
              avatar={searchRes.avatar}
              nick={searchRes.nick}
              account={searchRes.account}
            />
            <div className={`${_prefix}-info`}>
              <div className={`${_prefix}-info-name`}>
                {searchRes.nick || searchRes.account}
              </div>
              <div className={`${_prefix}-info-account`}>
                {searchRes.account}
              </div>
            </div>
            {store.uiStore.getRelationByAccount(searchRes.account) !==
            'stranger' ? (
              <Button type="primary" onClick={handleChat}>
                {t('chatButtonText')}
              </Button>
            ) : (
              <Button loading={adding} type="primary" onClick={handleAdd}>
                {t('addButtonText')}
              </Button>
            )}
          </div>
        ) : null}
      </Modal>
    )
  }
)

export default AddFriendModal
