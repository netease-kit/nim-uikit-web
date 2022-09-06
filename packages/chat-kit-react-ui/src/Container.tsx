import React from 'react'
import P2pChatContainer from './containers/p2pChatContainer'
import TeamChatContainer from './containers/teamChatContainer'
import { useStateContext, useEventTracking, Welcome } from '@xkit-yx/common-ui'
import { TMsgScene } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { RenderCustomMessageOptions } from './components/ChatMessageList'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { observer } from 'mobx-react'

import packageJson from '../package.json'

export interface ChatContainerProps {
  /**
    自定义选中的会话 sessionId。一般不用传，内部会处理好选中逻辑
    */
  selectedSession?: string
  /**
   自定义渲染未选中任何会话时的内容
   */
  renderEmpty?: () => JSX.Element
  /**
   自定义渲染聊天消息
   */
  renderCustomMessage?: (options: RenderCustomMessageOptions) => JSX.Element
  /**
   自定义渲染 header
   */
  renderHeader?: (session: Session) => JSX.Element
  /**
   自定义渲染 p2p 聊天输入框 placeholder
   */
  renderP2pInputPlaceHolder?: (session: Session) => string
  /**
   自定义渲染群组聊天输入框 placeholder
   */
  renderTeamInputPlaceHolder?: (params: {
    session: Session
    mute: boolean
  }) => string
  /**
   样式前缀
   */
  prefix?: string
  /**
     公共样式前缀
     */
  commonPrefix?: string
}

export const ChatContainer: React.FC<ChatContainerProps> = observer(
  ({
    selectedSession,
    renderEmpty,
    renderCustomMessage,
    renderHeader,
    renderP2pInputPlaceHolder,
    renderTeamInputPlaceHolder,

    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { store, nim, initOptions } = useStateContext()

    const finalSelectedSession =
      selectedSession || store.uiStore.selectedSession || ''

    const scene = finalSelectedSession.split('-')[0] as TMsgScene

    const to = finalSelectedSession.split('-')[1]

    useEventTracking({
      appkey: initOptions.appkey,
      version: packageJson.version,
      component: 'chat-kit',
      imVersion: nim.version,
    })

    return finalSelectedSession ? (
      scene === 'p2p' ? (
        <P2pChatContainer
          prefix={prefix}
          commonPrefix={commonPrefix}
          scene={scene}
          to={to}
          renderCustomMessage={renderCustomMessage}
          renderHeader={renderHeader}
          renderP2pInputPlaceHolder={renderP2pInputPlaceHolder}
        />
      ) : scene === 'team' ? (
        <TeamChatContainer
          prefix={prefix}
          commonPrefix={commonPrefix}
          scene={scene}
          to={to}
          renderCustomMessage={renderCustomMessage}
          renderHeader={renderHeader}
          renderTeamInputPlaceHolder={renderTeamInputPlaceHolder}
        />
      ) : null
    ) : renderEmpty ? (
      renderEmpty()
    ) : (
      <Welcome prefix={commonPrefix} />
    )
  }
)
