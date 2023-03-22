import { Button, message, Modal } from 'antd'
import {
  SearchInput,
  useTranslation,
  useStateContext,
} from '../../../../common'
import React, { useState } from 'react'
import { CrudeAvatar } from '../../../../common'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

export interface JoinTeamModalProps {
  visible: boolean
  onCancel: () => void
  onChat: (teamId: string) => void
  prefix?: string
  commonPrefix?: string
}

const JoinTeamModal: React.FC<JoinTeamModalProps> = ({
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
  const [inTeam, setInTeam] = useState(false)
  const [searchRes, setSearchRes] = useState<Team | undefined>(undefined)
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
      const { team, inTeam } = await store.uiStore.getTeamAndRelation(
        searchValue
      )
      if (!team) {
        setSearchResEmpty(true)
      } else {
        setInTeam(inTeam)
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
        if (searchRes.type === 'normal') {
          message.error(t('notSupportJoinText'))
          return
        }
        setAdding(true)
        await store.teamStore.applyTeamActive(searchRes.teamId)
        if (store.teamStore.teams.get(searchRes.teamId)) {
          setInTeam(true)
          message.success(t('joinTeamSuccessText'))
        } else {
          message.success(t('applyTeamSuccessText'))
        }
      }
      setAdding(false)
    } catch (error) {
      setAdding(false)
    }
  }

  const handleChat = async () => {
    if (searchRes) {
      await store.sessionStore.insertSessionActive('team', searchRes.teamId)
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
    setInTeam(false)
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

export default JoinTeamModal
