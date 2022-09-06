import { Button, Modal } from 'antd'
import {
  SearchInput,
  useTranslation,
  useStateContext,
} from '@xkit-yx/common-ui'
import React, { useState } from 'react'
import { CrudeAvatar } from '@xkit-yx/common-ui'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { ContextManagerTypes } from '@xkit-yx/common-ui'

export interface AddFriendModalProps {
  visible: boolean
  onCancel: () => void
  onChat: (account: string) => void
  prefix?: string
  commonPrefix?: string
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({
  visible,
  onCancel,
  onChat,
  prefix = 'search',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-add-modal`

  const { store } = useStateContext()

  const { t } = useTranslation()

  const [searchValue, setSearchValue] = useState('')
  const [relation, setRelation] =
    useState<ContextManagerTypes.Relation>('stranger')
  const [searchRes, setSearchRes] = useState<UserNameCard | undefined>(
    undefined
  )
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
      const { user, relation } = await store.uiStore.getUserAndRelation(
        searchValue
      )
      if (!user) {
        setSearchResEmpty(true)
      } else {
        setRelation(relation)
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
        await store.friendStore.addFriendActive(searchRes.account)
        setRelation('friend')
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
    setRelation('stranger')
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
            <div className={`${_prefix}-info-account`}>{searchRes.account}</div>
          </div>
          {relation !== 'stranger' ? (
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

export default AddFriendModal
