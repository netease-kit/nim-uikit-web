import React from 'react'
import { SettingOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { CHAT_ACTION } from '../../constant'

export interface ChatActionBarProps {
  prefix?: string
  className?: string
  currentActionIndex: number
  setCurrentActionIndex: (index: number) => void
  onSettingBtnClick: (action: string) => void
}

const ChatActionBar: React.FC<ChatActionBarProps> = ({
  prefix = 'chat',
  className,
  onSettingBtnClick,
  currentActionIndex,
  setCurrentActionIndex,
}) => {
  const _prefix = `${prefix}-action`

  type IconsProps = {
    key: number
    action: string
    content: JSX.Element
  }
  const ChatBarIcons: IconsProps[] = [
    {
      key: 0,
      action: CHAT_ACTION.chatSetting,
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
    //   key: 1,
    //   action: CHAT_ACTION.chatRecord,
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
    <div className={classNames(className, `${_prefix}-wrap`)}>
      {ChatBarIcons.map((item) => (
        <div
          key={item.key}
          onClick={() => {
            setCurrentActionIndex(item.key)
            onSettingBtnClick?.(item.action)
          }}
          className={classNames(
            `${_prefix}-setting`,
            `${
              currentActionIndex === item.key ? `${_prefix}-setting-active` : ''
            }`
          )}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}

export default ChatActionBar
