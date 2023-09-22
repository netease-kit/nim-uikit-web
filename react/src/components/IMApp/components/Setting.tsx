import React, { FC } from 'react'
import { Select, Modal, Form } from 'antd'
import '../index.less'
import { t } from '../util'
interface IProps {
  isSettingModalOpen: boolean
  handleSettingCancel: () => void
  p2pMsgReceiptVisible: boolean
  teamMsgReceiptVisible: boolean
  addFriendNeedVerify: boolean
  needMention: boolean
  teamManagerVisible: boolean
  locale: 'zh' | 'en'
}
const SettingModal: FC<IProps> = ({
  isSettingModalOpen,
  handleSettingCancel,
  p2pMsgReceiptVisible,
  teamMsgReceiptVisible,
  addFriendNeedVerify,
  needMention,
  teamManagerVisible,
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
        {/* <Form.Item label={t('sdkVersionSelectionText')}>
          <Select
            options={[
              { label: 'IM SDK', value: 1 },
              { label: 'IM Elite SDK ', value: 2 },
            ]}
            style={{ width: '150px' }}
            value={sdkVersion}
            onChange={(value) => {
              sessionStorage.setItem('sdkVersion', value.toString())
              window.location.reload()
            }}
          />
        </Form.Item> */}
        <Form.Item label={t('p2pMsgVisibleModeText')}>
          <Select
            options={[
              { label: t('yesText'), value: true },
              { label: t('noText'), value: false },
            ]}
            style={{ width: '150px' }}
            value={p2pMsgReceiptVisible}
            onChange={(value) => {
              sessionStorage.setItem('p2pMsgReceiptVisible', value.toString())
              window.location.reload()
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
              sessionStorage.setItem('teamMsgReceiptVisible', value.toString())
              window.location.reload()
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
              sessionStorage.setItem('addFriendNeedVerify', value.toString())
              window.location.reload()
            }}
          />
        </Form.Item>
        <Form.Item label={t('needMentionText')}>
          <Select
            options={[
              { label: t('yesText'), value: true },
              { label: t('noText'), value: false },
            ]}
            style={{ width: '150px' }}
            value={needMention}
            onChange={(value) => {
              sessionStorage.setItem('needMention', value.toString())
              window.location.reload()
            }}
          />
        </Form.Item>
        <Form.Item label={t('teamManagerEnableText')}>
          <Select
            options={[
              { label: t('yesText'), value: true },
              { label: t('noText'), value: false },
            ]}
            style={{ width: '150px' }}
            value={teamManagerVisible}
            onChange={(value) => {
              sessionStorage.setItem('teamManagerVisible', value.toString())
              window.location.reload()
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SettingModal
