import React from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import { CrudeAvatar, useTranslation } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

export interface PersonContainerProps {
  prefix?: string
  onCreateGroupClick: () => void
  selectedSession: NimKitCoreTypes.P2PSession
}

const ChatPerson: React.FC<PersonContainerProps> = ({
  prefix = 'chat',
  onCreateGroupClick,
  selectedSession,
}) => {
  const _prefix = `${prefix}-person-setting`
  const { t } = useTranslation()
  const { account, nick, avatar } = selectedSession

  return (
    <div
      className={classnames(`${_prefix}-wrap`)}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div className={classnames(`${_prefix}-item`)}>
        <CrudeAvatar size={36} account={account} nick={nick} avatar={avatar} />
        <span className={`${_prefix}-item-label`}>{nick || account}</span>
      </div>

      <div className={classnames(`${_prefix}-item`)}>
        <Button
          type="dashed"
          shape="circle"
          className={`${_prefix}-add-btn`}
          onClick={() => onCreateGroupClick()}
          icon={<PlusOutlined className={`${_prefix}-add-icon`} />}
        />
        <span className={`${_prefix}-item-label`}>
          {t('addChatMemberText')}
        </span>
      </div>
    </div>
  )
}

export default ChatPerson
