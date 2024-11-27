import React, { ReactNode } from 'react'
import P2pChatContainer from './containers/p2pChatContainer'
import TeamChatContainer from './containers/teamChatContainer'
import { useStateContext, useEventTracking, Welcome } from '../common'
import { RenderP2pCustomMessageOptions } from './components/ChatP2pMessageList'
import { RenderTeamCustomMessageOptions } from './components/ChatTeamMessageList'
import { ChatMessageInputProps } from './components/ChatMessageInput'
import { observer } from 'mobx-react'

import packageJson from '../../package.json'
import { GroupItemProps } from './components/ChatTeamSetting/GroupItem'
import { MenuItem } from './components/ChatMessageItem'
import { SettingActionItemProps } from './components/ChatActionBar'
import {
  V2NIMConversationType,
  V2NIMConversation,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMConversationService'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import sdkPkg from 'nim-web-sdk-ng/package.json'
import { V2NIMConst } from 'nim-web-sdk-ng'

export interface ActionRenderProps extends ChatMessageInputProps {
  conversationType: V2NIMConversationType
  receiverId: string
}

export interface Action {
  /**
    按钮类型
    */
  action: 'emoji' | 'sendImg' | 'sendFile' | string
  /**
    是否显示该按钮，自带按钮默认 true，新增自定义按钮默认 false
    */
  visible?: boolean
  /**
    自定义渲染，如果不传则使用默认渲染方式
    */
  render?: (props: ActionRenderProps) => ReactNode
}

export interface MsgOperMenuItem extends MenuItem {
  onClick?: (msg: V2NIMMessageForUI) => void
}

export interface ChatSettingActionItem extends SettingActionItemProps {
  onClick?: () => void
}

export interface ChatContainerProps {
  /**
    自定义选中的会话 conversationId。一般不用传，内部会处理好选中逻辑
    */
  selectedConversation?: string
  /**
    消息发送按钮组配置，不传使用默认的配置
    */
  actions?: Action[]
  /**
    单聊消息页面右侧设置栏按钮自定义，不传使用默认的配置
    */
  p2pSettingActions?: ChatSettingActionItem[]
  /**
    群聊消息页面右侧设置栏按钮自定义，不传使用默认的配置
    */
  teamSettingActions?: ChatSettingActionItem[]
  /**
   自定义渲染 消息右键菜单
   */
  msgOperMenu?: MsgOperMenuItem[]
  /**
    发送文字消息的回调，一般用于默认的文字发送缺少想要的字段时
    */
  onSendText?: (data: {
    value: string
    conversationType: V2NIMConversationType
    receiverId: string
  }) => Promise<void>
  /**
   转让群主后的回调
   */
  afterTransferTeam?: (teamId: string) => Promise<void>
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
  renderHeader?: (conversation: V2NIMConversation) => JSX.Element
  /**
   自定义渲染 p2p 聊天输入框 placeholder
   */
  renderP2pInputPlaceHolder?: (conversation: V2NIMConversation) => string
  /**
   自定义渲染群组聊天输入框 placeholder
   */
  renderTeamInputPlaceHolder?: (params: {
    conversation: V2NIMConversation
    mute: boolean
  }) => string
  /**
   自定义渲染群组成员 item
   */
  renderTeamMemberItem?: (
    params: GroupItemProps & {
      renderKey: string
      renderIndex: number
      renderStyle: React.CSSProperties
    }
  ) => JSX.Element | null | undefined
  /**
   自定义渲染消息头像
   */
  renderMessageAvatar?: (
    msg: V2NIMMessageForUI
  ) => JSX.Element | null | undefined
  /**
   自定义渲染消息昵称
   */
  renderMessageName?: (msg: V2NIMMessageForUI) => JSX.Element | null | undefined
  /**
   自定义渲染消息内容，气泡样式也需要自定义
   */
  renderMessageOuterContent?: (
    msg: V2NIMMessageForUI
  ) => JSX.Element | null | undefined
  /**
   自定义渲染消息内容，气泡样式不需要自定义
   */
  renderMessageInnerContent?: (
    msg: V2NIMMessageForUI
  ) => JSX.Element | null | undefined

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
    selectedConversation,
    actions,
    p2pSettingActions,
    teamSettingActions,
    msgOperMenu,
    onSendText,
    afterTransferTeam,
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
    const { store, nim } = useStateContext()

    const finalSelectedConversation =
      selectedConversation || store.uiStore.selectedConversation || ''

    const receiverId = nim.V2NIMConversationIdUtil.parseConversationTargetId(
      finalSelectedConversation
    )
    const conversationType = nim.V2NIMConversationIdUtil.parseConversationType(
      finalSelectedConversation
    )

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'ChatUIKit',
      imVersion: sdkPkg.version,
    })

    return finalSelectedConversation ? (
      conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P ? (
        <P2pChatContainer
          prefix={prefix}
          commonPrefix={commonPrefix}
          onSendText={onSendText}
          actions={actions}
          conversationType={conversationType}
          receiverId={receiverId}
          settingActions={p2pSettingActions}
          msgOperMenu={msgOperMenu}
          renderP2pCustomMessage={renderP2pCustomMessage}
          renderHeader={renderHeader}
          renderP2pInputPlaceHolder={renderP2pInputPlaceHolder}
          renderMessageAvatar={renderMessageAvatar}
          renderMessageName={renderMessageName}
          renderMessageInnerContent={renderMessageInnerContent}
          renderMessageOuterContent={renderMessageOuterContent}
        />
      ) : conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ? (
        <TeamChatContainer
          prefix={prefix}
          commonPrefix={commonPrefix}
          conversationType={conversationType}
          receiverId={receiverId}
          onSendText={onSendText}
          actions={actions}
          settingActions={teamSettingActions}
          msgOperMenu={msgOperMenu}
          afterTransferTeam={afterTransferTeam}
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
