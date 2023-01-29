import React, { FC } from 'react'
import { Select, Modal, Form } from 'antd'
import '../index.less'
import { demo_zh } from '../locales/demo_locale'

interface IProps {
  sdkVersion: 1 | 2
  setSdkVersion: React.Dispatch<React.SetStateAction<1 | 2>>
  isSettingModalOpen: boolean
  handleSettingCancel: () => void
  p2pMsgReceiptVisible: boolean
  setP2pMsgReceiptVisible: React.Dispatch<React.SetStateAction<boolean>>
  teamMsgReceiptVisible: boolean
  setTeamMsgReceiptVisible: React.Dispatch<React.SetStateAction<boolean>>
  addFriendNeedVerify: boolean
  setAddFriendNeedVerify: React.Dispatch<React.SetStateAction<boolean>>
  t: (str: keyof typeof demo_zh) => string
  locale: 'zh' | 'en'
}
const SettingModal: FC<IProps> = ({
  isSettingModalOpen,
  handleSettingCancel,
  sdkVersion,
  setSdkVersion,
  p2pMsgReceiptVisible,
  setP2pMsgReceiptVisible,
  teamMsgReceiptVisible,
  setTeamMsgReceiptVisible,
  addFriendNeedVerify,
  setAddFriendNeedVerify,
  t,
  locale,
}) => {
  return (
    <Modal
      title={t('settingText')}
      visible={isSettingModalOpen}
      onCancel={handleSettingCancel}
      footer={null}
      width={locale === 'zh' ? 420 : 460}
    >
      <Form labelCol={{ span: locale === 'zh' ? 12 : 14 }}>
        <Form.Item label={t('sdkVersionSelectionText')}>
          <Select
            options={[
              { label: 'IM SDK', value: 1 },
              { label: 'IM Elite SDK ', value: 2 },
            ]}
            style={{ width: '150px' }}
            value={sdkVersion}
            onChange={(value) => {
              setSdkVersion(value)
              sessionStorage.setItem('sdkVersion', value.toString())
            }}
          />
        </Form.Item>
        <Form.Item label={t('p2pMsgVisibleModeText')}>
          <Select
            options={[
              { label: t('yesText'), value: true },
              { label: t('noText'), value: false },
            ]}
            style={{ width: '150px' }}
            value={p2pMsgReceiptVisible}
            onChange={(value) => {
              setP2pMsgReceiptVisible(value)
              sessionStorage.setItem('p2pMsgReceiptVisible', value.toString())
            }}
          />
        </Form.Item>
        <Form.Item label={t('teamMsgVisibleModeText')}>
          <Select
            options={[
              { label: t('yesText'), value: true },
              { label: t('noText'), value: false },
            ]}
            style={{ width: '150px' }}
            value={teamMsgReceiptVisible}
            onChange={(value) => {
              setTeamMsgReceiptVisible(value)
              sessionStorage.setItem('teamMsgReceiptVisible', value.toString())
            }}
          />
        </Form.Item>
        <Form.Item label={t('addFriendMode')}>
          <Select
            options={[
              { label: t('needVerifyText'), value: true },
              { label: t('notNeedVerifyText'), value: false },
            ]}
            style={{ width: '150px' }}
            value={addFriendNeedVerify}
            onChange={(value) => {
              setAddFriendNeedVerify(value)
              sessionStorage.setItem('addFriendNeedVerify', value.toString())
              window.location.reload()
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SettingModal
