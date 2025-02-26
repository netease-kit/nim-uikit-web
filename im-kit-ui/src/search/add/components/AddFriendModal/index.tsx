import { Button, message, Modal } from 'antd'
import {
  SearchInput,
  useTranslation,
  useStateContext,
  CrudeAvatar,
} from '../../../../common'
import React, { useState } from 'react'
import { V2NIMUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService'
import { observer } from 'mobx-react'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

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
      (V2NIMUser & { alias?: string }) | undefined
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
            await store.friendStore.addFriendActive(searchRes.accountId, {
              addMode:
                V2NIMConst.V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_APPLY,
              postscript: '',
            })
            message.success(t('applyFriendSuccessText'))
          } else {
            await store.friendStore.addFriendActive(searchRes.accountId, {
              addMode: V2NIMConst.V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_ADD,
              postscript: '',
            })
            message.success(t('addFriendSuccessText'))
          }

          // 发送申请或添加好友成功后解除黑名单
          await store.relationStore.removeUserFromBlockListActive(
            searchRes.accountId
          )
        }

        setAdding(false)
      } catch (error) {
        setAdding(false)
      }
    }

    const handleChat = async () => {
      if (searchRes) {
        if (store.localOptions.enableLocalConversation) {
          await store.localConversationStore?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
            searchRes.accountId
          )
        } else {
          await store.conversationStore?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
            searchRes.accountId
          )
        }

        onChat(searchRes.accountId)
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
              nick={searchRes.name}
              account={searchRes.accountId}
            />
            <div className={`${_prefix}-info`}>
              <div className={`${_prefix}-info-name`}>
                {searchRes.name || searchRes.accountId}
              </div>
              <div className={`${_prefix}-info-account`}>
                {searchRes.accountId}
              </div>
            </div>
            {store.uiStore.getRelation(searchRes.accountId).relation !==
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
