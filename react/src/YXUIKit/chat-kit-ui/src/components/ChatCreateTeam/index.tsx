import React, { useState, useEffect } from 'react'
import { Form, Modal, Input } from 'antd'
import {
  urls,
  GroupAvatarSelect,
  FriendSelectContainer,
  useTranslation,
} from '../../../../common-ui/src'

export interface GroupCreateFormParams {
  name: string
}

// TODO 抽到 common 中，跟 search-kit 复用
export interface GroupCreateProps {
  defaultAccounts?: string[]
  visible: boolean
  onCancel: () => void
  onGroupCreate: (
    params: GroupCreateFormParams & {
      selectedAccounts: string[]
      avatar: string
    }
  ) => void

  prefix?: string
  commonPrefix?: string
}

const emptyArr = []

const GroupCreate: React.FC<GroupCreateProps> = ({
  defaultAccounts = emptyArr,
  onGroupCreate,
  visible,
  onCancel,

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const { t } = useTranslation()
  const [form] = Form.useForm<GroupCreateFormParams>()
  const _prefix = `${prefix}-group-create`

  const [avatar, setAvatar] = useState(urls[Math.floor(Math.random() * 5)])
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])

  useEffect(() => {
    setSelectedAccounts([...new Set(defaultAccounts)])
  }, [defaultAccounts])

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onGroupCreate({
          ...values,
          selectedAccounts,
          avatar,
          name: values.name.trim(),
        })
        resetState()
      })
      .catch(() => {
        //
      })
  }

  const handleCancel = () => {
    resetState()
    onCancel()
  }

  const resetState = () => {
    form.resetFields()
    setAvatar(urls[Math.floor(Math.random() * 5)])
    setSelectedAccounts([])
  }

  return (
    <Modal
      className={`${_prefix}-wrap`}
      title={t('createTeamText')}
      forceRender
      onOk={handleOk}
      onCancel={handleCancel}
      visible={visible}
      width={630}
      style={{ height: 500 }}
      cancelText={t('cancelText')}
      okText={t('createButtonText')}
    >
      <Form form={form} labelCol={{ span: 5 }}>
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
          // rules={[{ required: true, message: t('teamAvatarConfirmText') }]}
        >
          <GroupAvatarSelect
            prefix={commonPrefix}
            avatar={avatar}
            account={''}
            onSelect={setAvatar}
          />
        </Form.Item>
        <div style={{ height: 450 }}>
          <FriendSelectContainer
            prefix={commonPrefix}
            onSelect={(accounts) =>
              setSelectedAccounts(accounts.map((item) => item.account))
            }
            selectedAccounts={selectedAccounts}
          />
        </div>
      </Form>
    </Modal>
  )
}

export default GroupCreate
