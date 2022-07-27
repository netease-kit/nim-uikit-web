import React, { useState } from 'react'
import { Modal } from 'antd'
import { FriendSelectContainer, useTranslation } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
// import { SearchInput } from '@x-kit-react/search-kit'

interface ChatAddMemebersProps {
  prefix?: string
  commonPrefix?: string
  visible?: boolean
  onCancel?: () => void
  selectedAccounts: string[]
  setSelectedAccounts: React.Dispatch<
    React.SetStateAction<NimKitCoreTypes.IFriendInfo[]>
  >
  onGroupAddMembers: (selectedSession: NimKitCoreTypes.ISession) => void
  selectedSession: NimKitCoreTypes.ISession
}

const ChatAddMemebers: React.FC<ChatAddMemebersProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  onGroupAddMembers,
  selectedSession,
  selectedAccounts,
  setSelectedAccounts,
  visible,
  onCancel,
}) => {
  // const [searchText, setSearchText] = useState('')

  const { t } = useTranslation()
  const _prefix = `${prefix}-add-members`

  return (
    <Modal
      className={`${_prefix}-wrap`}
      title={t('addTeamMemberText')}
      onOk={() => {
        onGroupAddMembers(selectedSession)
      }}
      onCancel={() => onCancel?.()}
      visible={visible}
      width={630}
      cancelText={t('cancelText')}
      okText={t('addTeamMemberText')}
    >
      {/* <SearchInput value={searchText} onChange={setSearchText} /> */}
      <div style={{ height: 450 }}>
        <FriendSelectContainer
          prefix={commonPrefix}
          onSelect={(selectedList) => setSelectedAccounts(selectedList)}
          selectedAccounts={selectedAccounts}
        />
      </div>
    </Modal>
  )
}

export default ChatAddMemebers
