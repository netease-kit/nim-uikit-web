import { Button, message, Modal, Input } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import {
  urls,
  FriendSelect,
  GroupAvatarSelect,
  useTranslation,
  useStateContext,
} from '../../'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { observer } from 'mobx-react'

const emptyArr = []

export interface CreateTeamModalProps {
  defaultAccounts?: string[]
  visible: boolean
  onChat: (teamId: string) => void
  onAfterCreate?: () => void
  onCancel: () => void
  prefix?: string
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = observer(
  ({
    defaultAccounts = emptyArr,
    visible,
    onChat,
    onAfterCreate,
    onCancel,
    prefix = 'common',
  }) => {
    const _prefix = `${prefix}-create-team`

    const { t } = useTranslation()

    const { store } = useStateContext()

    const [selectedList, setSelectedList] = useState<string[]>(defaultAccounts)
    const [groupName, setGroupName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(
      urls[Math.floor(Math.random() * 5)]
    )
    const [teamId, setTeamId] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
      resetState()
    }, [visible])

    const handleCreate = async () => {
      try {
        setCreating(true)
        const team = await store.teamStore.createTeamActive({
          accounts: selectedList,
          avatar: avatarUrl,
          name: groupName.trim(),
          intro: '',
        })

        message.success(t('createTeamSuccessText'))
        setTeamId(team.teamId)
        setCreating(false)
        onAfterCreate?.()
      } catch (error) {
        message.error(t('createTeamFailedText'))
        setCreating(false)
      }
    }

    const handleChat = async () => {
      if (teamId) {
        if (store.sdkOptions?.enableV2CloudConversation) {
          await store.conversationStore?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
            teamId
          )
        } else {
          await store.localConversationStore?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
            teamId
          )
        }

        onChat(teamId)
      }
    }

    const resetState = () => {
      setSelectedList(defaultAccounts)
      setGroupName('')
      setAvatarUrl(urls[Math.floor(Math.random() * 5)])
      setTeamId('')
      setCreating(false)
    }

    const handleSelect = useCallback((accounts: string[]) => {
      setSelectedList(accounts)
    }, [])

    const footer = (
      <div className={`${_prefix}-footer`}>
        <Button onClick={onCancel}>{t('cancelText')}</Button>
        {teamId ? (
          <Button onClick={handleChat} type="primary">
            {t('chatButtonText')}
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            type="primary"
            disabled={!groupName || !selectedList.length}
            loading={creating}
          >
            {t('createButtonText')}
          </Button>
        )}
      </div>
    )

    return (
      <Modal
        className={_prefix}
        title={t('createTeamText')}
        visible={visible}
        onCancel={onCancel}
        destroyOnClose={true}
        width={630}
        footer={footer}
      >
        <div className={`${_prefix}-group-name`}>
          <div className={`${_prefix}-group-name-content`}>
            {t('teamTitle')}
          </div>
          <Input
            className={`${_prefix}-group-name-input`}
            placeholder={t('searchTeamPlaceholder')}
            maxLength={30}
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value)
            }}
          />
        </div>
        <div className={`${_prefix}-group-avatar`}>
          <div className={`${_prefix}-group-avatar-content`}>
            {t('teamAvatarText')}
          </div>
          <GroupAvatarSelect
            avatar={avatarUrl}
            onSelect={(url) => {
              setAvatarUrl(url)
            }}
            account={''}
            prefix={prefix}
          />
        </div>
        <div className={`${_prefix}-group-friendList`}>
          <FriendSelect
            disabledAccounts={defaultAccounts}
            onSelect={handleSelect}
            max={200}
            selectedAccounts={selectedList}
            prefix={prefix}
          />
        </div>
      </Modal>
    )
  }
)
