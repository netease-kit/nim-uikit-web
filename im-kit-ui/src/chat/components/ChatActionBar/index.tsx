import React from 'react'
import { SettingOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { ChatAction } from '../../types'
import { mergeActions } from '../../../utils'

export interface SettingActionItemProps {
  // 唯一 key
  action: ChatAction
  // 是否显示，自带按钮默认 true，新增自定义按钮默认 false
  visible?: boolean
  // 自定义渲染函数
  render?: () => JSX.Element
}

export interface ChatActionBarProps {
  prefix?: string
  action?: ChatAction
  settingActions?: SettingActionItemProps[]
  onActionClick: (action: ChatAction) => void
}

const ChatActionBar: React.FC<ChatActionBarProps> = ({
  prefix = 'chat',
  action = '',
  settingActions,
  onActionClick,
}) => {
  const _prefix = `${prefix}-action`

  const defaultChatActions: SettingActionItemProps[] = [
    {
      action: 'chatSetting',
      visible: true,
      render: () => (
        <SettingOutlined
          className={`${_prefix}-icon`}
          style={{ fontSize: 18 }}
        />
        // <Icon
        //   className={`${_prefix}-icon`}
        //   width={18}
        //   height={18}
        //   color={currentActionIndex === 0 ? '#2a6bf2' : ''}
        //   type="icon-shezhi"
        // />
      ),
    },
    // {
    //   action: 'chatRecord',
    //   content: (
    //     <CommentOutlined
    //       className={`${_prefix}-icon`}
    //       style={{ fontSize: 18 }}
    //     />
    //     // <Icon
    //     //   className={`${_prefix}-icon`}
    //     //   width={18}
    //     //   height={18}
    //     //   color="#2a6bf2"
    //     //   fill="#999999"
    //     //   type="icon-lishixiaoxi"
    //     // />
    //   ),
    // },
  ]

  const finalChatActions = settingActions
    ? mergeActions(defaultChatActions, settingActions, 'action')
    : defaultChatActions

  return (
    <div className={`${_prefix}-wrap`}>
      {finalChatActions.map(
        (item) =>
          item.visible &&
          item.render && (
            <div
              key={item.action}
              onClick={() => {
                onActionClick(item.action)
              }}
              className={classNames(
                `${_prefix}-setting`,
                `${action === item.action ? `${_prefix}-setting-active` : ''}`
              )}
            >
              {item.render?.()}
            </div>
          )
      )}
    </div>
  )
}

export default ChatActionBar
