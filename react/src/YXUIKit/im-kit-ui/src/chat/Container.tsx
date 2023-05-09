import React, { ReactNode } from 'react'
import P2pChatContainer from './containers/p2pChatContainer'
import TeamChatContainer from './containers/teamChatContainer'
import { useStateContext, useEventTracking, Welcome, Utils } from '../common'
import {
  IMMessage,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { RenderP2pCustomMessageOptions } from './components/ChatP2pMessageList'
import { RenderTeamCustomMessageOptions } from './components/ChatTeamMessageList'
import { ChatMessageInputProps } from './components/ChatMessageInput'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { observer } from 'mobx-react'

import packageJson from '../../package.json'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { GroupItemProps } from './components/ChatTeamSetting/GroupItem'

export interface ActionRenderProps extends ChatMessageInputProps {
  scene: TMsgScene
  to: string
}

export interface Action {
  /**
    按钮类型
    */
  action: 'emoji' | 'sendImg' | 'sendFile' | string
  /**
    是否显示该按钮，默认 true
    */
  visible?: boolean
  /**
    自定义渲染，如果不传则使用默认渲染方式
    */
  render?: (props: ActionRenderProps) => ReactNode
}

export interface ChatContainerProps {
  /**
    自定义选中的会话 sessionId。一般不用传，内部会处理好选中逻辑
    */
  selectedSession?: string
  /**
    消息发送按钮组配置，不传使用默认的配置
    */
  actions?: Action[]
  /**
    是否需要显示 p2p 消息已读未读，默认 false
    */
  p2pMsgReceiptVisible?: boolean
  /**
    是否需要显示群组消息已读未读，默认 false
    */
  teamMsgReceiptVisible?: boolean
  /**
    发送文字消息的回调，一般用于默认的文字发送缺少想要的字段时
    */
  onSendText?: (data: {
    value: string
    scene: TMsgScene
    to: string
  }) => Promise<void>
  /**
   自定义渲染未选中任何会话时的内容
   */
  renderEmpty?: () => JSX.Element
  /**
   自定义点对点聊天消息渲染
   */
  renderP2pCustomMessage?: (
    options: RenderP2pCustomMessageOptions
  ) => JSX.Element | null | undefined
  /**
   自定义群组聊天消息渲染
   */
  renderTeamCustomMessage?: (
    options: RenderTeamCustomMessageOptions
  ) => JSX.Element | null | undefined
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
   自定义渲染群组成员 item
   */
  renderTeamMemberItem?: (
    params: GroupItemProps
  ) => JSX.Element | null | undefined
  /**
   自定义渲染消息头像
   */
  renderMessageAvatar?: (msg: IMMessage) => JSX.Element | null | undefined
  /**
   自定义渲染消息昵称
   */
  renderMessageName?: (msg: IMMessage) => JSX.Element | null | undefined
  /**
   自定义渲染消息内容，气泡样式也需要自定义
   */
  renderMessageOuterContent?: (msg: IMMessage) => JSX.Element | null | undefined
  /**
   自定义渲染消息内容，气泡样式不需要自定义
   */
  renderMessageInnerContent?: (msg: IMMessage) => JSX.Element | null | undefined

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
    actions,
    p2pMsgReceiptVisible = false,
    teamMsgReceiptVisible = false,
    onSendText,
    renderEmpty,
    renderP2pCustomMessage,
    renderTeamCustomMessage,
    renderHeader,
    renderP2pInputPlaceHolder,
    renderTeamInputPlaceHolder,
    renderTeamMemberItem,
    renderMessageAvatar,
    renderMessageName,
    renderMessageInnerContent,
    renderMessageOuterContent,

    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { store, nim, initOptions } = useStateContext()

    const finalSelectedSession =
      selectedSession || store.uiStore.selectedSession || ''

    const { scene, to } = Utils.parseSessionId(finalSelectedSession)

    useEventTracking({
      appkey: initOptions.appkey,
      version: packageJson.version,
      component: 'ChatUIKit',
      imVersion: nim.version,
    })

    return finalSelectedSession ? (
      scene === 'p2p' ? (
        <P2pChatContainer
          prefix={prefix}
          commonPrefix={commonPrefix}
          scene={scene}
          to={to}
          p2pMsgReceiptVisible={p2pMsgReceiptVisible}
          onSendText={onSendText}
          actions={actions}
          renderP2pCustomMessage={renderP2pCustomMessage}
          renderHeader={renderHeader}
          renderP2pInputPlaceHolder={renderP2pInputPlaceHolder}
          renderMessageAvatar={renderMessageAvatar}
          renderMessageName={renderMessageName}
          renderMessageInnerContent={renderMessageInnerContent}
          renderMessageOuterContent={renderMessageOuterContent}
        />
      ) : scene === 'team' ? (
        <TeamChatContainer
          prefix={prefix}
          commonPrefix={commonPrefix}
          scene={scene}
          to={to}
          teamMsgReceiptVisible={teamMsgReceiptVisible}
          onSendText={onSendText}
          actions={actions}
          renderTeamCustomMessage={renderTeamCustomMessage}
          renderHeader={renderHeader}
          renderTeamInputPlaceHolder={renderTeamInputPlaceHolder}
          renderTeamMemberItem={renderTeamMemberItem}
          renderMessageAvatar={renderMessageAvatar}
          renderMessageName={renderMessageName}
          renderMessageInnerContent={renderMessageInnerContent}
          renderMessageOuterContent={renderMessageOuterContent}
        />
      ) : null
    ) : renderEmpty ? (
      renderEmpty()
    ) : (
      <Welcome prefix={commonPrefix} />
    )
  }
)
