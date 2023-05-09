import React, { FC, useEffect, useState } from 'react'
import { Form, Input, Button } from 'antd'
import { GroupAvatarSelect, useTranslation, CrudeAvatar } from '../../../common'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

export interface GroupDetailmProps {
  team: Team
  hasPower: boolean
  onUpdateTeamInfo: (team: Partial<Team>) => void

  prefix?: string
  commonPrefix?: string
}

const GroupDetail: FC<GroupDetailmProps> = ({
  team,
  hasPower,
  onUpdateTeamInfo,

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const { t } = useTranslation()

  const [avatar, setAvatar] = useState('')
  const [intro, setIntro] = useState('')
  const [name, setName] = useState('')

  const _prefix = `${prefix}-group-detail`

  useEffect(() => {
    setAvatar(team.avatar)
  }, [team.avatar])

  useEffect(() => {
    if (team.intro) {
      setIntro(team.intro)
    }
  }, [team.intro])

  useEffect(() => {
    setName(team.name)
  }, [team.name])

  const onUpdateTeamInfoSubmitHandler = () => {
    const obj: Partial<Team> = { avatar, name, intro }
    Object.keys(obj).forEach((key) => {
      if (obj[key] === team[key]) {
        delete obj[key]
      }
    })
    onUpdateTeamInfo({ ...obj, teamId: team.teamId })
  }

  return (
    <Form className={`${_prefix}-wrap`} layout="vertical">
      <Form.Item
        className={`${_prefix}-avatar-box`}
        label={<b>{t('teamAvatarText')}</b>}
        name="avatar"
      >
        {hasPower ? (
          <GroupAvatarSelect
            prefix={commonPrefix}
            avatar={avatar}
            account={team.teamId}
            nick={team.name}
            onSelect={setAvatar}
          />
        ) : (
          <CrudeAvatar account={team.teamId} nick={team.name} avatar={avatar} />
        )}
      </Form.Item>
      <Form.Item label={<b>{t('teamIdText')}</b>}>
        <Input
          disabled
          className={`${_prefix}-form-input`}
          value={team.teamId}
        />
      </Form.Item>
      <Form.Item label={<b>{t('teamTitle')}</b>}>
        <Input
          disabled={!hasPower}
          className={`${_prefix}-form-input`}
          showCount
          maxLength={30}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
          placeholder={t('teamTitlePlaceholder')}
        />
      </Form.Item>
      <Form.Item label={<b>{t('teamSignText')}</b>}>
        <Input.TextArea
          disabled={!hasPower}
          className={`${_prefix}-form-input`}
          maxLength={100}
          showCount
          rows={4}
          value={intro}
          onChange={(e) => {
            setIntro(e.target.value)
          }}
          placeholder={t('teamSignPlaceholder')}
        />
      </Form.Item>
      <Button
        className={`${_prefix}-save-btn`}
        type="primary"
        disabled={!hasPower}
        onClick={onUpdateTeamInfoSubmitHandler}
      >
        {t('saveText')}
      </Button>
    </Form>
  )
}

export default GroupDetail
