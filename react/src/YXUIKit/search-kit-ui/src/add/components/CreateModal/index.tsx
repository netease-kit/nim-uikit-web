import { Button, message, Modal, Input } from 'antd'
import React, { useState } from 'react'
import {
  urls,
  FriendSelectContainer,
  GroupAvatarSelect,
  useTranslation,
  useStateContext,
} from '../../../../../common-ui/src'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

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

  const [selectedList, setSelectedList] = useState<
    NimKitCoreTypes.IFriendInfo[]
  >([])
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
        accounts: selectedList.map((item) => item.account),
        avatar: avatarUrl,
        name: groupName,
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
      await store.sessionStore.insertSessionActive('team', teamId)
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
            setGroupName(e.target.value.trim())
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
          onSelect={(list) => {
            setSelectedList(list)
          }}
          max={10}
          selectedAccounts={selectedList.map((item) => item.account)}
          prefix={commonPrefix}
        />
      </div>
    </Modal>
  )
}

export default CreateModal
