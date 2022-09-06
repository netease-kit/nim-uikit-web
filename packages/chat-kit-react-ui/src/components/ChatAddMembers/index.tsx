import React, { useEffect, useState } from 'react'
import { message, Modal } from 'antd'
import { FriendSelectContainer, useTranslation } from '@xkit-yx/common-ui'
// import { SearchInput } from '@x-kit-react/search-kit'

interface ChatAddMemebersProps {
  defaultAccounts?: string[]
  visible: boolean
  onCancel: () => void
  onGroupAddMembers: (selectedAccounts: string[]) => void

  prefix?: string
  commonPrefix?: string
}

const ChatAddMemebers: React.FC<ChatAddMemebersProps> = ({
  defaultAccounts = [],
  visible,
  onCancel,
  onGroupAddMembers,

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  // const [searchText, setSearchText] = useState('')

  useEffect(() => {
    // TODO 这边没有考虑 defaultAccounts 减少的情况
    setSelectedAccounts((value) => [...new Set(value.concat(defaultAccounts))])
  }, [defaultAccounts])

  const { t } = useTranslation()
  const _prefix = `${prefix}-add-members`

  const handleOk = () => {
    if (!selectedAccounts.length) {
      message.error(t('addTeamMemberConfirmText'))
      return
    }
    onGroupAddMembers(selectedAccounts)
    resetState()
  }

  const handleCancel = () => {
    onCancel()
    resetState()
  }

  const resetState = () => {
    setSelectedAccounts([])
  }

  return (
    <Modal
      className={`${_prefix}-wrap`}
      title={t('addTeamMemberText')}
      onOk={handleOk}
      onCancel={handleCancel}
      visible={visible}
      width={630}
      cancelText={t('cancelText')}
      okText={t('addTeamMemberText')}
    >
      {/* <SearchInput value={searchText} onChange={setSearchText} /> */}
      <div style={{ height: 450 }}>
        <FriendSelectContainer
          prefix={commonPrefix}
          onSelect={(selectedList) =>
            setSelectedAccounts(selectedList.map((item) => item.account))
          }
          selectedAccounts={selectedAccounts}
        />
      </div>
    </Modal>
  )
}

export default ChatAddMemebers
