import React, { useState } from 'react'
import { Modal, Radio, Input, message, Button } from 'antd'
import {
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../../common'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { SearchOutlined, CloseOutlined } from '@ant-design/icons'
interface GroupActionModalProps {
  title: string // 标题
  visible: boolean
  members: (TeamMember & Partial<FriendProfile>)[] // 成员列表
  onOk: (account: string) => void // 确认操作的回调函数
  onCancel: () => void
  prefix?: string
  commonPrefix?: string
  teamId: string
  groupSearchText: string
  onTeamMemberSearchChange: (searchText: string) => void
}

const GroupActionModal: React.FC<GroupActionModalProps> = ({
  title,
  members,
  onOk,
  visible,
  onCancel,
  teamId,
  onTeamMemberSearchChange,
  groupSearchText,
  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('') // 选中的成员 ID

  const handleMemberSelect = (e) => {
    setSelectedMemberId(e.target.value)
  }
  const { t } = useTranslation()

  const { store } = useStateContext()
  const _prefix = `${prefix}-group-action-modal`

  const handleCancel = () => {
    onCancel()
    setSelectedMemberId('')
  }

  const handleOk = () => {
    try {
      onOk(selectedMemberId)
    } catch (error) {
      message.error(t('transferTeamFailedText'))
    }
  }

  const handleSearch = (searchText: string) => {
    onTeamMemberSearchChange(searchText)
  }

  const handleSelectReset = () => {
    setSelectedMemberId('')
  }
  return (
    <Modal
      title={title}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ disabled: !selectedMemberId }}
      closable={false}
      width={720}
    >
      <div className={`${_prefix}-content`}>
        <div className={`${_prefix}-content-left`}>
          <Input
            prefix={<SearchOutlined style={{ color: '#b3b7bc' }} />}
            allowClear
            value={groupSearchText}
            className={`${_prefix}-content-input`}
            placeholder={t('searchTeamMemberPlaceholder')}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {members.length ? (
            <div>
              <div className={`${_prefix}-content-sub-title`}>
                {t('teamMemberText')}
              </div>
              <Radio.Group
                style={{ width: '100%' }}
                value={selectedMemberId}
                defaultValue={null}
                onChange={handleMemberSelect}
              >
                {members.map((member) => {
                  return (
                    <div
                      key={member.account}
                      className={`${_prefix}-content-member ${
                        member.account === selectedMemberId
                          ? `${_prefix}-content-member-focus`
                          : ''
                      }`}
                    >
                      <Radio
                        value={member.account}
                        disabled={member.type === 'owner'}
                      />
                      <ComplexAvatarContainer
                        prefix={commonPrefix}
                        canClick={false}
                        account={member.account}
                        size={32}
                      />
                      <span className={`${_prefix}-content-member-text`}>
                        {store.uiStore.getAppellation({
                          account: member.account,
                          teamId: member.teamId,
                        })}
                      </span>
                    </div>
                  )
                })}
              </Radio.Group>
            </div>
          ) : (
            <div className={`${_prefix}-content-no-result`}>
              {t('searchNoResText')}
            </div>
          )}
        </div>
        <div className={`${_prefix}-content-right`}>
          <div className={`${_prefix}-content-sub-title`}>
            {t('selectedText')}
            {selectedMemberId ? 1 : 0}/1
          </div>
          {selectedMemberId ? (
            <div className={`${_prefix}-content-select`}>
              <ComplexAvatarContainer
                prefix={commonPrefix}
                canClick={false}
                account={selectedMemberId}
                size={32}
              />
              <span className={`${_prefix}-content-right-text`}>
                {store.uiStore.getAppellation({
                  account: selectedMemberId,
                  teamId: teamId,
                })}
              </span>
              <Button
                style={{ marginLeft: 'auto' }}
                type="text"
                icon={<CloseOutlined className={`${_prefix}-content-close`} />}
                onClick={handleSelectReset}
              ></Button>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}

export default GroupActionModal
