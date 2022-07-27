import React from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import { CrudeAvatar, useTranslation } from '@xkit-yx/common-ui'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'

export interface PersonContainerProps {
  prefix?: string
  onCreateGroupClick: () => void
  myUserInfo: UserNameCard
}

const ChatPerson: React.FC<PersonContainerProps> = ({
  prefix = 'chat',
  onCreateGroupClick,
  myUserInfo,
}) => {
  const _prefix = `${prefix}-person-setting`

  const { t } = useTranslation()
  const { account, nick, avatar } = myUserInfo

  return (
    <div
      className={classnames(`${_prefix}-wrap`)}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div className={classnames(`${_prefix}-item`)}>
        <CrudeAvatar size={36} account={account} nick={nick} avatar={avatar} />
        <span className={`${_prefix}-item-label`}>{nick}</span>
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
