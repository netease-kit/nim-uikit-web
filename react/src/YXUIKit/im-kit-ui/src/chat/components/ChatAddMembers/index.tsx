import React, { useCallback, useEffect, useState } from 'react'
import { message, Modal } from 'antd'
import { FriendSelect, useTranslation } from '../../../common'
// import { SearchInput } from '@x-kit-react/search-kit'

interface ChatAddMemebersProps {
  defaultAccounts?: string[]
  visible: boolean
  onCancel: () => void
  onGroupAddMembers: (selectedAccounts: string[]) => void

  prefix?: string
  commonPrefix?: string
}

const emptyArr = []

const ChatAddMemebers: React.FC<ChatAddMemebersProps> = ({
  defaultAccounts = emptyArr,
  visible,
  onCancel,
  onGroupAddMembers,

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const [selectedAccounts, setSelectedAccounts] =
    useState<string[]>(defaultAccounts)
  // const [searchText, setSearchText] = useState('')

  useEffect(() => {
    resetState()
  }, [visible])

  const { t } = useTranslation()
  const _prefix = `${prefix}-add-members`

  const handleOk = () => {
    if (!selectedAccounts.length) {
      message.error(t('addTeamMemberConfirmText'))
      return
    }

    onGroupAddMembers(selectedAccounts)
  }

  const handleCancel = () => {
    onCancel()
  }

  const resetState = () => {
    setSelectedAccounts(defaultAccounts)
  }

  const handleSelect = useCallback((selectedList: string[]) => {
    setSelectedAccounts(selectedList)
  }, [])

  return (
    <Modal
      className={`${_prefix}-wrap`}
      title={t('addTeamMemberText')}
      onOk={handleOk}
      onCancel={handleCancel}
      visible={visible}
      width={630}
      cancelText={t('cancelText')}
      destroyOnClose={true}
      okText={t('addTeamMemberText')}
    >
      {/* <SearchInput value={searchText} onChange={setSearchText} /> */}
      <div style={{ height: 450 }}>
        <FriendSelect
          max={200}
          prefix={commonPrefix}
          onSelect={handleSelect}
          selectedAccounts={selectedAccounts}
          disabledAccounts={defaultAccounts}
        />
      </div>
    </Modal>
  )
}

export default ChatAddMemebers
