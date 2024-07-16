import React from 'react'
import { Button, Switch } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import {
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../../common'
import { observer } from 'mobx-react'

export interface ChatP2pSettingProps {
  onCreateGroupClick: () => void
  account: string
  alias?: string
  nick?: string

  prefix?: string
  commonPrefix?: string
}

const ChatP2pSetting: React.FC<ChatP2pSettingProps> = observer(
  ({
    onCreateGroupClick,
    account,
    alias = '',
    nick = '',

    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const _prefix = `${prefix}-person-setting`

    const { store } = useStateContext()

    const { t } = useTranslation()

    const { relation } = store.uiStore.getRelation(account)

    const isAIPin =
      relation === 'ai' ? store.aiUserStore.isAIPinUser(account) : false

    const handleAIPinChange = (checked: boolean) => {
      const myServerExt = store.userStore.getMyUserServerExt()
      let unpinAIUsers = myServerExt.unpinAIUsers || []

      if (checked) {
        unpinAIUsers = unpinAIUsers.filter((item) => item !== account)
      } else {
        unpinAIUsers = unpinAIUsers.concat(account)
      }

      store.userStore.updateSelfUserProfileActive({
        serverExtension: JSON.stringify({ ...myServerExt, unpinAIUsers }),
      })
    }

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
          <span className={`${_prefix}-item-label`}>
            {alias || nick || account}
          </span>
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

        {relation === 'ai' &&
        store.aiUserStore.getAIUserServerExt(account).pinDefault === 1 ? (
          <div
            className={classnames(`${_prefix}-item`)}
            style={{ justifyContent: 'space-between' }}
          >
            <span className={`${_prefix}-item-label`}>{t('pinAIText')}</span>
            <Switch checked={isAIPin} onChange={handleAIPinChange} />
          </div>
        ) : null}
      </div>
    )
  }
)

export default ChatP2pSetting
