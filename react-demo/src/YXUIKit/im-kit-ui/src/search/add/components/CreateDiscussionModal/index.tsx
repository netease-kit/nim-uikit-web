import { Button, message, Modal, Input } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import {
  urls,
  FriendSelect,
  useTranslation,
  useStateContext,
} from '../../../../common'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { observer } from 'mobx-react'
import { V2NIMError } from 'nim-web-sdk-ng/dist/esm/nim/src/types'

const emptyArr = []

export interface CreateDiscussionModalProps {
  defaultAccounts?: string[]
  visible: boolean
  onChat: (teamId: string) => void
  onAfterCreate?: () => void
  onCancel: () => void
  prefix?: string
}

const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = observer(
  ({
    defaultAccounts = emptyArr,
    visible,
    onChat,
    onAfterCreate,
    onCancel,
    prefix = 'common',
  }) => {
    const _prefix = `search-create-discussion`

    const { t } = useTranslation()

    const { store } = useStateContext()

    const [selectedList, setSelectedList] = useState<string[]>(defaultAccounts)
    const [avatarUrl, setAvatarUrl] = useState(
      urls[Math.floor(Math.random() * 5)]
    )
    const [teamId, setTeamId] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
      resetState()
    }, [visible])

    const createDiscussionName = (selectedMembers: string[]) => {
      const _memberNickArr: string[] = []

      selectedMembers.map((item) => {
        _memberNickArr.push(store.uiStore.getAppellation({ account: item }))
      })

      const _ownerName =
        store.userStore.myUserInfo.name || store.userStore.myUserInfo.accountId
      const _groupName = (_ownerName + '、' + _memberNickArr.join('、')).slice(
        0,
        30
      )

      return _groupName
    }

    const handleCreate = async () => {
      try {
        setCreating(true)
        const team = await store.teamStore.createTeamActive({
          type: V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
          accounts: selectedList,
          avatar: avatarUrl,
          name: createDiscussionName(selectedList),
          joinMode: V2NIMConst.V2NIMTeamJoinMode.V2NIM_TEAM_JOIN_MODE_FREE,
          agreeMode:
            V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
          inviteMode: V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL,
          updateInfoMode:
            V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL,
          updateExtensionMode:
            V2NIMConst.V2NIMTeamUpdateExtensionMode
              .V2NIM_TEAM_UPDATE_EXTENSION_MODE_ALL,
          serverExtension: JSON.stringify({
            im_ui_kit_group: true,
          }),
        })

        message.success(t('createTeamSuccessText'))
        setTeamId(team.teamId)
        setCreating(false)
        onAfterCreate?.()
      } catch (error) {
        switch ((error as V2NIMError)?.code) {
          case 108437:
            message.error(t('createTeamMemberLimitText'))
            break
          default:
            message.error(t('createTeamFailedText'))
        }

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
            disabled={!selectedList.length}
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
        title={t('createDiscussionText')}
        visible={visible}
        onCancel={onCancel}
        destroyOnClose={true}
        width={630}
        footer={footer}
      >
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

export default CreateDiscussionModal
