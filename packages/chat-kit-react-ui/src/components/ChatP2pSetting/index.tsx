import React from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import { ComplexAvatarContainer, useTranslation } from '@xkit-yx/common-ui'

export interface ChatP2pSettingProps {
  onCreateGroupClick: () => void
  account: string
  nick?: string

  prefix?: string
  commonPrefix?: string
}

const ChatP2pSetting: React.FC<ChatP2pSettingProps> = ({
  onCreateGroupClick,
  account,
  nick = '',

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-person-setting`
  const { t } = useTranslation()

  return (
    <div
      className={classnames(`${_prefix}-wrap`)}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div className={classnames(`${_prefix}-item`)}>
        <ComplexAvatarContainer
          account={account}
          canClick={false}
          prefix={commonPrefix}
        />
        <span className={`${_prefix}-item-label`}>{nick || account}</span>
      </div>

      <div className={classnames(`${_prefix}-item`)}>
        <Button
          type="dashed"
          shape="circle"
          className={`${_prefix}-add-btn`}
          onClick={onCreateGroupClick}
          icon={<PlusOutlined className={`${_prefix}-add-icon`} />}
        />
        <span className={`${_prefix}-item-label`}>
          {t('addChatMemberText')}
        </span>
      </div>
    </div>
  )
}

export default ChatP2pSetting
