import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Input, message } from 'antd'
import {
  useTranslation,
  ComplexAvatarContainer,
  useStateContext,
  CrudeAvatar,
  SelectModal,
} from '../../../common'
import {
  IMMessage,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { parseSessionId } from '../../../utils'
import { SelectModalItemProps } from '../../../common/components/SelectModal'

export interface ChatForwardModalProps {
  msg: IMMessage
  visible: boolean
  onSend: () => void
  onCancel: () => void

  prefix?: string
  commonPrefix?: string
}

export interface ChatForwardModalItemProps {
  scene: TMsgScene
  to: string
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
  const { store } = useStateContext()

  const [comment, setComment] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    resetState()
  }, [visible])

  const _prefix = `${prefix}-forward-modal`

  const datasource: SelectModalItemProps[] = useMemo(() => {
    if (isSearching) {
      const friends = store.uiStore.friends
        .filter((item) => !store.relationStore.blacklist.includes(item.account))
        .map((item) => ({
          key: 'p2p-' + item.account,
          label: store.uiStore.getAppellation({ account: item.account }),
        }))
      const teams = store.uiStore.teamList.map((item) => ({
        key: 'team-' + item.teamId,
        label: item.name || item.teamId,
      }))
      return [...friends, ...teams]
    }
    const res = [...store.sessionStore.sessions.values()]
      .map((item) => {
        if (item.scene === 'p2p') {
          return {
            key: item.id,
            label: store.uiStore.getAppellation({ account: item.to }),
          }
        }
        if (item.scene === 'team') {
          const team = store.teamStore.teams.get(item.to)
          return {
            key: item.id,
            label: team?.name || team?.teamId || '',
          }
        }
        return null
      })
      .filter((item) => !!item) as SelectModalItemProps[]

    return res
  }, [
    isSearching,
    store.sessionStore.sessions,
    store.teamStore.teams,
    store.relationStore.blacklist,
    store.uiStore,
  ])

  const itemAvatarRender = useCallback(
    (data: SelectModalItemProps) => {
      const { scene, to } = parseSessionId(data.key)
      if (scene === 'p2p') {
        return (
          <ComplexAvatarContainer
            prefix={commonPrefix}
            canClick={false}
            account={to}
            size={32}
          />
        )
      }
      if (scene === 'team') {
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
    },
    [commonPrefix, store.teamStore.teams]
  )

  const handleCommentChange = (e: any) => {
    setComment(e.target.value)
  }

  const resetState = () => {
    setComment('')
    setIsSearching(false)
  }

  const handleOk = async (data: SelectModalItemProps[]) => {
    const { scene, to } = parseSessionId(data[0].key)
    if (scene && to) {
      try {
        await store.msgStore.forwardMsgActive(
          {
            msg,
            scene: scene as TMsgScene,
            to,
          },
          comment
        )
        onSend()
      } catch (error) {
        message.error(t('forwardFailedText'))
        throw error
      }
    }
  }

  const handleSearchChang = useCallback((value) => {
    setIsSearching(!!value)
  }, [])

  return (
    <SelectModal
      title={t('forwardText')}
      visible={visible}
      datasource={datasource}
      itemAvatarRender={itemAvatarRender}
      onSearchChange={handleSearchChang}
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
