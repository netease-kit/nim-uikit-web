import React, { FC, useEffect, useState } from 'react'
import { Form, Input, Button } from 'antd'
import { GroupAvatarSelect, useTranslation, CrudeAvatar } from '../../../common'
import {
  V2NIMTeam,
  V2NIMUpdatedTeamInfo,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService'

export interface GroupDetailmProps {
  team: V2NIMTeam
  hasPower: boolean
  onUpdateTeamInfo: (team: V2NIMUpdatedTeamInfo) => void

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

  const { intro: lastIntro = '' } = team

  const _prefix = `${prefix}-group-detail`

  useEffect(() => {
    setAvatar(team.avatar)
  }, [team.avatar])

  useEffect(() => {
    setIntro(lastIntro)
  }, [lastIntro])

  useEffect(() => {
    setName(team.name)
  }, [team.name])

  const onUpdateTeamInfoSubmitHandler = () => {
    const obj: V2NIMUpdatedTeamInfo = { avatar, name, intro }
    Object.keys(obj).forEach((key) => {
      if (obj[key] === team[key]) {
        delete obj[key]
      }
    })
    onUpdateTeamInfo(obj)
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
