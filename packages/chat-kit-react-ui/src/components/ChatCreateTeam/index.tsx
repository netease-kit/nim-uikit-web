import React, { useEffect } from 'react'
import { Form, Modal, Input } from 'antd'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import {
  urls,
  GroupAvatarSelect,
  FriendSelectContainer,
  useTranslation,
} from '@xkit-yx/common-ui'

interface GroupCreateProps {
  prefix?: string
  commonPrefix?: string
  visible?: boolean
  onCancel?: () => void
  selectedAccounts: string[]
  setSelectedAccounts: React.Dispatch<
    React.SetStateAction<NimKitCoreTypes.IFriendInfo[]>
  >
  onGroupCreate: (formValues) => void
}

const GroupCreate: React.FC<GroupCreateProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  selectedAccounts,
  setSelectedAccounts,
  onGroupCreate,
  visible,
  onCancel,
}) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const _prefix = `${prefix}-group-create`
  const avatar = urls[Math.floor(Math.random() * 5)]

  useEffect(() => {
    form.setFieldsValue({
      avatar,
    })
  }, [])

  return (
    <Modal
      className={`${_prefix}-wrap`}
      title={t('createTeamText')}
      forceRender
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onGroupCreate(values)
          })
          .catch(() => {
            //
          })
      }}
      onCancel={() => onCancel?.()}
      visible={visible}
      width={630}
      style={{ height: 500 }}
      cancelText={t('cancelText')}
      okText={t('createButtonText')}
    >
      <Form form={form}>
        <Form.Item
          label={t('teamTitle')}
          name="name"
          rules={[{ required: true, message: t('teamTitleConfirmText') }]}
        >
          <Input
            placeholder={t('searchTeamPlaceholder')}
            style={{ width: 400 }}
            onChange={(e) => {
              form.setFieldsValue({
                name: e.target.value,
              })
            }}
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item
          name="avatar"
          label={t('teamAvatarText')}
          rules={[{ required: true, message: t('teamAvatarConfirmText') }]}
        >
          <GroupAvatarSelect
            prefix={commonPrefix}
            avatar={avatar}
            account={''}
            onSelect={(avatar) => {
              form.setFieldsValue({
                avatar,
              })
            }}
          />
        </Form.Item>
        <div style={{ height: 450 }}>
          <FriendSelectContainer
            prefix={commonPrefix}
            onSelect={(accounts) => setSelectedAccounts(accounts)}
            selectedAccounts={selectedAccounts}
          />
        </div>
      </Form>
    </Modal>
  )
}

export default GroupCreate
