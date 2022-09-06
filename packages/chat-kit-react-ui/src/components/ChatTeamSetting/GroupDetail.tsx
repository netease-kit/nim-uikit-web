import React, { FC, useEffect } from 'react'
import { Form, Input, Button } from 'antd'
import {
  GroupAvatarSelect,
  useTranslation,
  CrudeAvatar,
} from '@xkit-yx/common-ui'
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

  const _prefix = `${prefix}-group-detail`

  const [form] = Form.useForm<Partial<Team>>()

  useEffect(() => {
    form.setFieldsValue({
      ...team,
    })
  }, [form, team])

  const onUpdateTeamInfoSubmitHandler = () => {
    const value = form.getFieldsValue()
    onUpdateTeamInfo(value)
  }

  return (
    <Form className={`${_prefix}-wrap`} form={form} layout="vertical">
      <Form.Item
        className={`${_prefix}-avatar-box`}
        label={<b>{t('teamAvatarText')}</b>}
        name="avatar"
      >
        {hasPower ? (
          <GroupAvatarSelect
            prefix={commonPrefix}
            avatar={team.avatar}
            account={team.teamId}
            onSelect={(avatar) => {
              form.setFieldsValue({
                avatar,
              })
            }}
          />
        ) : (
          <CrudeAvatar
            account={team.teamId}
            nick={team.name}
            avatar={team.avatar}
          />
        )}
      </Form.Item>
      <Form.Item name="teamId" label={<b>{t('teamIdText')}</b>}>
        <Input disabled className={`${_prefix}-form-input`} />
      </Form.Item>
      <Form.Item name="name" label={<b>{t('teamTitle')}</b>}>
        <Input
          disabled={!hasPower}
          className={`${_prefix}-form-input`}
          showCount
          maxLength={30}
          placeholder={t('teamTitlePlaceholder')}
        />
      </Form.Item>
      <Form.Item name="intro" label={<b>{t('teamSignText')}</b>}>
        <Input.TextArea
          disabled={!hasPower}
          className={`${_prefix}-form-input`}
          maxLength={100}
          showCount
          rows={4}
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
