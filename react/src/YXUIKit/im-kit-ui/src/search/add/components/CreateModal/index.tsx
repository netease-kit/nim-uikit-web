import { Button, message, Modal, Input } from 'antd'
import React, { useState } from 'react'
import {
  urls,
  FriendSelectContainer,
  GroupAvatarSelect,
  useTranslation,
  useStateContext,
} from '../../../../common'
import { V2NIMConst } from 'nim-web-sdk-ng'

export interface CreateModalProps {
  visible: boolean
  onChat: (teamId: string) => void
  onCancel: () => void
  prefix?: string
  commonPrefix?: string
}

const CreateModal: React.FC<CreateModalProps> = ({
  visible,
  onChat,
  onCancel,
  prefix = 'search',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-add-create-modal`

  const { t } = useTranslation()

  const { store } = useStateContext()

  const [selectedList, setSelectedList] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(
    urls[Math.floor(Math.random() * 5)]
  )
  const [teamId, setTeamId] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    try {
      setCreating(true)
      const team = await store.teamStore.createTeamActive({
        accounts: selectedList,
        avatar: avatarUrl,
        name: groupName.trim(),
      })
      message.success(t('createTeamSuccessText'))
      setTeamId(team.teamId)
      setCreating(false)
    } catch (error) {
      message.error(t('createTeamFailedText'))
      setCreating(false)
    }
  }

  const handleChat = async () => {
    if (teamId) {
      await store.conversationStore.insertConversationActive(
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
        teamId
      )
      onChat(teamId)
      resetState()
    }
  }

  const handleCancel = () => {
    onCancel()
    resetState()
  }

  const resetState = () => {
    setSelectedList([])
    setGroupName('')
    setAvatarUrl(urls[Math.floor(Math.random() * 5)])
    setTeamId('')
    setCreating(false)
  }

  const footer = (
    <div className={`${_prefix}-footer`}>
      <Button onClick={handleCancel}>{t('cancelText')}</Button>
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
      onCancel={handleCancel}
      width={530}
      footer={footer}
    >
      <div className={`${_prefix}-group-name`}>
        <div className={`${_prefix}-group-name-content`}>{t('teamTitle')}</div>
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
          prefix={commonPrefix}
        />
      </div>

      <div className={`${_prefix}-group-friendList`}>
        <div className={`${_prefix}-group-friendList-content`}>
          {t('addTeamMemberText')}
        </div>
        <FriendSelectContainer
          onSelect={(accounts) => {
            setSelectedList(accounts)
          }}
          max={10}
          selectedAccounts={selectedList}
          prefix={commonPrefix}
        />
      </div>
    </Modal>
  )
}

export default CreateModal
