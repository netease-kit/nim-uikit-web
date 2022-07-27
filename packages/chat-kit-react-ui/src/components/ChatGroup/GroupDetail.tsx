import React, { FC, useEffect } from 'react'
import { Form, Input, Button } from 'antd'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import { ITeamInfo } from '../../types'
import {
  GroupAvatarSelect,
  CrudeAvatar,
  useTranslation,
} from '@xkit-yx/common-ui'

interface GroupDetailmProps {
  prefix?: string
  commonPrefix?: string
  teamInfo: ITeamInfo
  initOptions: NIMInitializeOptions
  isGroupOwner: boolean
  isGroupManager: boolean
  hasUpdateTeamModePower: boolean
  onUpdateTeamInfoSubmit: (formValues) => void
}

const GroupDetail: FC<GroupDetailmProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  onUpdateTeamInfoSubmit,
  teamInfo,
  hasUpdateTeamModePower,
}) => {
  const { t } = useTranslation()
  const _prefix = `${prefix}-group-detail`

  const [form] = Form.useForm()
  useEffect(() => {
    form.setFieldsValue({
      ...teamInfo,
    })
  }, [])

  return (
    <Form className={`${_prefix}-wrap`} form={form} layout="vertical">
      <Form.Item
        className={`${_prefix}-avatar-box`}
        label={<b>{t('teamAvatarText')}</b>}
        name="avatar"
      >
        {hasUpdateTeamModePower ? (
          <GroupAvatarSelect
            prefix={commonPrefix}
            avatar={teamInfo.avatar}
            account={''}
            onSelect={(avatar) => {
              form.setFieldsValue({
                avatar,
              })
            }}
          />
        ) : (
          <CrudeAvatar avatar={teamInfo.avatar} account={''} />
        )}
      </Form.Item>
      <Form.Item name="teamId" label={<b>{t('teamIdText')}</b>}>
        <Input disabled className={`${_prefix}-form-input`} />
      </Form.Item>
      <Form.Item name="name" label={<b>{t('teamTitle')}</b>}>
        <Input
          disabled={!hasUpdateTeamModePower}
          className={`${_prefix}-form-input`}
          showCount
          maxLength={30}
          placeholder={t('teamTitlePlaceholder')}
        />
      </Form.Item>
      <Form.Item name="intro" label={<b>{t('teamSignText')}</b>}>
        <Input.TextArea
          disabled={!hasUpdateTeamModePower}
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
        disabled={!hasUpdateTeamModePower}
        onClick={() => {
          onUpdateTeamInfoSubmit(form.getFieldsValue())
        }}
      >
        {t('saveText')}
      </Button>
    </Form>
  )
}

export default GroupDetail
