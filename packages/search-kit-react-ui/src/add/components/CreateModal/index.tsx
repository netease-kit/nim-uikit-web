import { Button, message, Modal, Input } from 'antd'
import React, { useState, useEffect } from 'react'
import {
  urls,
  FriendSelectContainer,
  GroupAvatarSelect,
  useTranslation,
} from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
export interface TeamInfo {
  selectedList: NimKitCoreTypes.IFriendInfo[]
  avatarUrl: string
  groupName: string
}
export interface CreateModalProps {
  title: string
  visible: boolean
  handleOk: (
    state: string,
    teamInfo: TeamInfo,
    teamId?: string
  ) => Promise<void | Team>
  onCancel?: () => void
  placeholder?: string
  prefix?: string
  commonPrefix?: string
}

const CreateModal: React.FC<CreateModalProps> = ({
  title,
  visible = false,
  placeholder,
  handleOk,
  onCancel,
  prefix = 'search',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-add-create-modal`

  const { t } = useTranslation()
  const avatar = urls[Math.floor(Math.random() * 5)]

  placeholder = placeholder || t('searchTeamPlaceholder')
  const [selectedList, setSelectedList] = useState<
    NimKitCoreTypes.IFriendInfo[]
  >([])
  const [groupName, setGroupName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(avatar)
  const [btnContent, setBtnContent] = useState(t('createButtonText'))
  const [btnOpacity, setBtnOpacity] = useState(0.5)
  const [teamId, setTeamId] = useState('')

  useEffect(() => {
    if (groupName.trim() !== '' && selectedList.length !== 0) {
      setBtnOpacity(1)
    } else {
      setBtnOpacity(0.5)
    }
  }, [groupName, selectedList])

  const onClick = () => {
    if (btnContent === t('createButtonText')) {
      if (selectedList.length !== 0 && groupName.trim() !== '') {
        const res = handleOk('create', {
          selectedList,
          groupName,
          avatarUrl,
        }) as Promise<Team>

        res
          .then((res) => {
            message.success(t('createTeamSuccessText'))
            setBtnContent(t('chatButtonText'))
            setTeamId(res.teamId)
          })
          .catch((error) => {
            message.error(t('createTeamFailedText'))
            console.error('创建群组失败：', error)
          })
      }
    } else if (btnContent === t('chatButtonText')) {
      handleOk('chat', { selectedList, groupName, avatarUrl }, teamId)
    }
  }
  const footer = (
    <div className={`${_prefix}-footer`}>
      <Button onClick={() => onCancel?.()}>{t('cancelText')}</Button>
      <Button
        onClick={() => onClick()}
        type="primary"
        style={{ opacity: btnOpacity }}
      >
        {btnContent}
      </Button>
    </div>
  )
  const init = () => {
    setBtnContent(t('createButtonText'))
    setSelectedList([])
    setBtnOpacity(0.5)
  }
  return (
    <div>
      <Modal
        className={_prefix}
        title={title}
        visible={visible}
        onCancel={() => onCancel?.()}
        width={530}
        destroyOnClose={true}
        footer={footer}
        afterClose={init}
      >
        <div className={`${_prefix}-group-name`}>
          <div className={`${_prefix}-group-name-content`}>
            {t('teamTitle')}
          </div>
          <Input
            placeholder={placeholder}
            maxLength={30}
            onBlur={(e) => {
              setGroupName(e.target.value)
            }}
          />
        </div>
        <div className={`${_prefix}-group-avatar`}>
          <div className={`${_prefix}-group-avatar-content`}>
            {t('teamAvatarText')}
          </div>
          <GroupAvatarSelect
            avatar={avatarUrl}
            onSelect={(url) => {
              setAvatarUrl(url)
            }}
            account={''}
            prefix={commonPrefix}
          />
        </div>

        <div className={`${_prefix}-group-friendList`}>
          <div className={`${_prefix}-group-friendList-content`}>
            {t('addTeamMemberText')}
          </div>
          <FriendSelectContainer
            onSelect={(list) => {
              setSelectedList(list)
            }}
            max={10}
            selectedAccounts={selectedList.map((item) => item.account)}
            prefix={commonPrefix}
          />
        </div>
      </Modal>
    </div>
  )
}

export default CreateModal
