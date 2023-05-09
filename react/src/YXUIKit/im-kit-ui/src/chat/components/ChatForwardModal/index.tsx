import React, { useMemo, useState } from 'react'
import { Modal, Input, Radio, Button, message } from 'antd'
import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import {
  useTranslation,
  ComplexAvatarContainer,
  useStateContext,
  CrudeAvatar,
} from '../../../common'
import {
  IMMessage,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { parseSessionId } from '../../../utils'

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
  const [searchText, setSearchText] = useState('')
  const [selectSessionId, setSelectSessionId] = useState('')
  const [sending, setSending] = useState(false)

  const list: ChatForwardModalItemProps[] = useMemo(() => {
    if (searchText) {
      const friends = store.uiStore.friendsWithoutBlacklist
        .filter((item) =>
          (item.alias || item.nick || item.account).includes(searchText)
        )
        .map((item) => ({
          scene: 'p2p' as TMsgScene,
          to: item.account,
        }))
      const teams = store.uiStore.teamList
        .filter((item) => (item.name || item.teamId).includes(searchText))
        .map((item) => ({
          scene: 'team' as TMsgScene,
          to: item.teamId,
        }))
      return [...friends, ...teams]
    }
    return [...store.sessionStore.sessions.values()].map((item) => ({
      scene: item.scene,
      to: item.to,
    }))
  }, [
    searchText,
    store.uiStore.teamList,
    store.uiStore.friendsWithoutBlacklist,
    store.sessionStore.sessions,
  ])

  const _prefix = `${prefix}-forward-modal`

  const handleSearchTextChange = (e: any) => {
    setSearchText(e.target.value)
  }

  const handleSelect = (e: any) => {
    setSelectSessionId(e.target.value)
  }

  const handleSelectReset = () => {
    setSelectSessionId('')
  }

  const handleCommentChange = (e: any) => {
    setComment(e.target.value)
  }

  const resetState = () => {
    setComment('')
    setSearchText('')
    setSelectSessionId('')
    setSending(false)
  }

  const handleCancel = () => {
    onCancel()
    resetState()
  }

  const handleOk = async () => {
    const { scene, to } = parseSessionId(selectSessionId)
    if (scene && to) {
      try {
        setSending(true)
        await store.msgStore.forwardMsgActive(
          {
            msg,
            scene: scene as TMsgScene,
            to,
          },
          comment
        )
        onSend()
        resetState()
      } catch (error) {
        message.error(t('forwardFailedText'))
      } finally {
        setSending(false)
      }
    }
  }

  return (
    <Modal
      okText={t('sendBtnText')}
      title={t('forwardText')}
      okButtonProps={{ disabled: !selectSessionId, loading: sending }}
      closable={false}
      width={720}
      visible={visible}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <div className={`${_prefix}-content`}>
        <div className={`${_prefix}-content-left`}>
          <Input
            className={`${_prefix}-input`}
            value={searchText}
            prefix={<SearchOutlined style={{ color: '#b3b7bc' }} />}
            allowClear
            onChange={handleSearchTextChange}
            placeholder={t('searchInputPlaceholder')}
          />
          <div className={`${_prefix}-content-l-title`}>
            {t(searchText ? 'searchText' : 'recentSessionText')}
          </div>
          <div className={`${_prefix}-content-list`}>
            <Radio.Group
              onChange={handleSelect}
              value={selectSessionId}
              style={{ width: '100%' }}
            >
              {!list.length ? (
                <div className={`${_prefix}-content-empty`}>
                  {t('searchNoResText')}
                </div>
              ) : (
                list.map((item) => (
                  <div
                    className={`${_prefix}-content-item ${
                      `${item.scene}-${item.to}` === selectSessionId
                        ? `${_prefix}-content-item-focus`
                        : ''
                    }`}
                    key={`${item.scene}-${item.to}`}
                  >
                    {item.scene === 'p2p' ? (
                      <>
                        <Radio value={`${item.scene}-${item.to}`} />
                        <ComplexAvatarContainer
                          prefix={commonPrefix}
                          canClick={false}
                          account={item.to}
                          size={32}
                        />
                        <span className={`${_prefix}-content-text`}>
                          {store.uiStore.getAppellation({ account: item.to })}
                        </span>
                      </>
                    ) : item.scene === 'team' ? (
                      (() => {
                        const team = store.teamStore.teams.get(item.to)
                        return (
                          <>
                            <Radio value={`${item.scene}-${item.to}`} />
                            <CrudeAvatar
                              account={item.to}
                              avatar={team?.avatar || ''}
                              nick={team?.name || ''}
                              size={32}
                            />
                            <span className={`${_prefix}-content-text`}>
                              {team?.name || team?.teamId || ''}
                            </span>
                          </>
                        )
                      })()
                    ) : null}
                  </div>
                ))
              )}
            </Radio.Group>
          </div>
        </div>
        <div className={`${_prefix}-content-right`}>
          <div className={`${_prefix}-content-r-title`}>{t('sendToText')}</div>
          {selectSessionId ? (
            <div className={`${_prefix}-content-chose`}>
              {(() => {
                const { scene, to } = parseSessionId(selectSessionId)
                if (scene === 'team') {
                  const team = store.teamStore.teams.get(to)
                  return (
                    <>
                      <CrudeAvatar
                        account={to}
                        avatar={team?.avatar || ''}
                        nick={team?.name || ''}
                        size={32}
                      />
                      <span className={`${_prefix}-content-text`}>
                        {team?.name || team?.teamId || ''}
                      </span>
                    </>
                  )
                }
                if (scene === 'p2p') {
                  return (
                    <>
                      <ComplexAvatarContainer
                        prefix={commonPrefix}
                        canClick={false}
                        account={to}
                        size={32}
                      />
                      <span className={`${_prefix}-content-text`}>
                        {store.uiStore.getAppellation({ account: to })}
                      </span>
                    </>
                  )
                }
                return null
              })()}
              <Button
                style={{ marginLeft: 'auto' }}
                type="text"
                icon={<CloseOutlined className={`${_prefix}-content-close`} />}
                onClick={handleSelectReset}
              ></Button>
            </div>
          ) : null}
        </div>
      </div>
      <Input
        className={`${_prefix}-input`}
        placeholder={t('commentText')}
        allowClear
        value={comment}
        onChange={handleCommentChange}
      />
    </Modal>
  )
}

export default ChatForwardModal
