import React, { useEffect, useMemo, useState } from 'react'
import { Input, message } from 'antd'
import {
  useTranslation,
  ComplexAvatarContainer,
  useStateContext,
  CrudeAvatar,
  SelectModal,
} from '../../../common'
import { SelectModalItemProps } from '../../../common/components/SelectModal'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng'

export interface ChatForwardModalProps {
  msg?: V2NIMMessageForUI
  visible: boolean
  onSend: () => void
  onCancel: () => void

  prefix?: string
  commonPrefix?: string
}

const ChatForwardModal: React.FC<ChatForwardModalProps> = ({
  msg,
  visible,
  onCancel,
  onSend,
  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const { t } = useTranslation()
  const { nim, store } = useStateContext()

  const [comment, setComment] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    resetState()
  }, [visible])

  const _prefix = `${prefix}-forward-modal`

  const datasource: SelectModalItemProps[] = useMemo(() => {
    if (isSearching) {
      const friends = store.uiStore.friends
        .filter(
          (item) => !store.relationStore.blacklist.includes(item.accountId)
        )
        .map((item) => ({
          key: nim.V2NIMConversationIdUtil.p2pConversationId(item.accountId),
          label: store.uiStore.getAppellation({ account: item.accountId }),
        }))
      const teams = store.uiStore.teamList.map((item) => ({
        key: nim.V2NIMConversationIdUtil.teamConversationId(item.teamId),
        label: item.name || item.teamId,
      }))
      return [...friends, ...teams]
    }
    const res = [...store.conversationStore.conversations.values()]
      .map((item) => {
        if (
          item.type ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
        ) {
          return {
            key: item.conversationId,
            label: store.uiStore.getAppellation({
              account: nim.V2NIMConversationIdUtil.parseConversationTargetId(
                item.conversationId
              ),
            }),
          }
        }
        if (
          item.type ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ) {
          const teamId = nim.V2NIMConversationIdUtil.parseConversationTargetId(
            item.conversationId
          )
          const team = store.teamStore.teams.get(teamId)
          return {
            key: item.conversationId,
            label: team?.name || team?.teamId || '',
          }
        }
        return null
      })
      .filter((item) => !!item) as SelectModalItemProps[]

    return res
  }, [
    nim.V2NIMConversationIdUtil,
    isSearching,
    store.conversationStore.conversations,
    store.teamStore.teams,
    store.relationStore.blacklist,
    store.uiStore,
  ])

  const itemAvatarRender = (data: SelectModalItemProps) => {
    const to = nim.V2NIMConversationIdUtil.parseConversationTargetId(data.key)
    const conversationType = nim.V2NIMConversationIdUtil.parseConversationType(
      data.key
    )
    if (
      conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
    ) {
      return (
        <ComplexAvatarContainer
          prefix={commonPrefix}
          canClick={false}
          account={to}
          size={32}
        />
      )
    }
    if (
      conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
    ) {
      const team = store.teamStore.teams.get(to)
      return (
        <CrudeAvatar
          account={to}
          avatar={team?.avatar || ''}
          nick={team?.name || ''}
          size={32}
        />
      )
    }
    return null
  }

  const handleCommentChange = (e: any) => {
    setComment(e.target.value)
  }

  const resetState = () => {
    setComment('')
    setIsSearching(false)
  }

  const handleOk = async (data: SelectModalItemProps[]) => {
    if (data[0].key && msg) {
      try {
        await store.msgStore.forwardMsgActive(msg, data[0].key, comment)
        onSend()
      } catch (error) {
        message.error(t('forwardFailedText'))
        throw error
      }
    }
  }

  return (
    <SelectModal
      title={t('forwardText')}
      visible={visible}
      datasource={datasource}
      itemAvatarRender={itemAvatarRender}
      onSearchChange={(value) => {
        setIsSearching(!!value)
      }}
      type="radio"
      min={1}
      okText={t('sendBtnText')}
      searchPlaceholder={t('searchInputPlaceholder')}
      leftTitle={t(isSearching ? 'searchText' : 'recentSessionText')}
      rightTitle={t('sendToText')}
      bottomRenderer={
        <Input
          className={`${_prefix}-input`}
          placeholder={t('commentText')}
          allowClear
          value={comment}
          onChange={handleCommentChange}
        />
      }
      onOk={handleOk}
      onCancel={onCancel}
      prefix={commonPrefix}
    />
  )
}

export default ChatForwardModal
