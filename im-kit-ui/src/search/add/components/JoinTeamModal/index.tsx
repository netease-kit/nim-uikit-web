import { Button, message, Modal } from 'antd'
import {
  SearchInput,
  useTranslation,
  useStateContext,
  CrudeAvatar,
} from '../../../../common'
import React, { useState } from 'react'
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import { observer } from 'mobx-react'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

export interface JoinTeamModalProps {
  visible: boolean
  onCancel: () => void
  onChat: (teamId: string) => void
  prefix?: string
  commonPrefix?: string
}

const JoinTeamModal: React.FC<JoinTeamModalProps> = observer(
  ({
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
    const [searchRes, setSearchRes] = useState<V2NIMTeam | undefined>(undefined)
    const [searchResEmpty, setSearchResEmpty] = useState(false)
    const [searching, setSearching] = useState(false)
    const [adding, setAdding] = useState(false)

    const inTeam = store.teamStore.teams.get(searchRes?.teamId || '')

    const handleChange = (val: string) => {
      setSearchValue(val)
      setSearchResEmpty(false)
      setSearchRes(undefined)
    }

    const handleSearch = async () => {
      try {
        setSearching(true)
        const team = await store.teamStore.getTeamForceActive(searchValue)

        if (!team) {
          setSearchResEmpty(true)
        } else {
          setSearchRes(team)
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
          if (
            searchRes.teamType ===
            V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_INVALID
          ) {
            message.error(t('notSupportJoinText'))
            return
          }

          setAdding(true)
          await store.teamStore.applyTeamActive(searchRes.teamId)
          // 目前没有申请加入群组，直接写死
          message.success(t('joinTeamSuccessText'))
        }

        setAdding(false)
      } catch (error) {
        message.error(t('joinTeamFailedText'))
        setAdding(false)
      }
    }

    const handleChat = async () => {
      if (searchRes) {
        if (store.sdkOptions?.enableV2CloudConversation) {
          await store.conversationStore?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
            searchRes.teamId
          )
        } else {
          await store.localConversationStore?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
            searchRes.teamId
          )
        }

        onChat(searchRes.teamId)
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
      <div>
        <Modal
          className={_prefix}
          title={t('joinTeamText')}
          onCancel={handleCancel}
          visible={visible}
          width={460}
          footer={!searchRes ? renderFooter() : null}
        >
          <SearchInput
            placeholder={t('teamIdPlaceholder')}
            prefix={commonPrefix}
            onChange={handleChange}
            value={searchValue}
          />
          {searchResEmpty ? (
            <div className={`${_prefix}-empty-content`}>
              {t('teamIdNotMatchText')}
            </div>
          ) : searchRes ? (
            <div className={`${_prefix}-content`}>
              <CrudeAvatar
                avatar={searchRes.avatar}
                nick={searchRes.name}
                account={searchRes.teamId}
              />
              <div className={`${_prefix}-info`}>
                <div className={`${_prefix}-info-name`}>
                  {searchRes.name || searchRes.teamId}
                </div>
                <div className={`${_prefix}-info-account`}>
                  {searchRes.teamId}
                </div>
              </div>
              {inTeam ? (
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
      </div>
    )
  }
)

export default JoinTeamModal
