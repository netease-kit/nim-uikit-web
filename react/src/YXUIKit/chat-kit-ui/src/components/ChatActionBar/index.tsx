import React from 'react'
import { SettingOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { ChatAction } from '../../types'

export interface ChatActionBarProps {
  prefix?: string
  action?: ChatAction
  onActionClick: (action: ChatAction) => void
}

const ChatActionBar: React.FC<ChatActionBarProps> = ({
  prefix = 'chat',
  action = '',
  onActionClick,
}) => {
  const _prefix = `${prefix}-action`

  type IconsProps = {
    action: ChatAction
    content: JSX.Element
  }
  const ChatBarIcons: IconsProps[] = [
    {
      action: 'chatSetting',
      content: (
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

  return (
    <div className={`${_prefix}-wrap`}>
      {ChatBarIcons.map((item) => (
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
          {item.content}
        </div>
      ))}
    </div>
  )
}

export default ChatActionBar
