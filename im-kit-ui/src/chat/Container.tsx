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
} from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMConversationService'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import sdkPkg from 'nim-web-sdk-ng/package.json'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { MAX_UPLOAD_FILE_SIZE } from '../constant'
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMLocalConversationService'
import { V2NIMUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService'

export interface ActionRenderProps extends ChatMessageInputProps {
  conversationType: V2NIMConversationType
  receiverId: string
}

export interface Action {
  /**
    按钮类型
    */
  action: 'emoji' | 'sendImg' | 'sendFile' | 'aiTranslate' | 'sendMsg' | string
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
    聊天列表头像点击事件
    */
  onMessageItemAvatarClick?: (user: V2NIMUser) => void

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
  renderHeader?: (
    conversation: V2NIMConversation | V2NIMLocalConversation
  ) => JSX.Element
  /**
   自定义渲染 p2p 聊天输入框 placeholder
   */
  renderP2pInputPlaceHolder?: (
    conversation: V2NIMConversation | V2NIMLocalConversation
  ) => string
  /**
   自定义渲染群组聊天输入框 placeholder
   */
  renderTeamInputPlaceHolder?: (params: {
    conversation: V2NIMConversation | V2NIMLocalConversation
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
  /**
    消息可撤回的最大时间，单位毫秒，默认 2 * 60 * 1000, 最大支持7天内的消息可撤回
  */
  msgRecallTime?: number
  /**
    是否展示陌生人提示
  */
  strangerTipVisible?: boolean
  /**
    上拉加载消息滚动模式，组件在上拉加载消息时，默认会自动滚动到最新的消息，当组件位于可滚动的页面中时，可能会造成滚动异常，设置nearest即可
  */
  scrollIntoMode?: 'nearest'
  /**
   * 最大上传文件大小，单位Mb，默认 100M
   */
  maxUploadFileSize?: number
  /**
   * 是否允许发送视频
   */
  enableSendVideo?: boolean
}

export const ChatContainer: React.FC<ChatContainerProps> = observer(
  ({
    selectedConversation,
    actions,
    p2pSettingActions,
    teamSettingActions,
    msgOperMenu,
    maxUploadFileSize = MAX_UPLOAD_FILE_SIZE,
    onSendText,
    onMessageItemAvatarClick,
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

    msgRecallTime = 2 * 60 * 1000,
    prefix = 'chat',
    commonPrefix = 'common',
    strangerTipVisible = true,
    enableSendVideo = true,
    scrollIntoMode,
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
          maxUploadFileSize={maxUploadFileSize}
          conversationType={conversationType}
          receiverId={receiverId}
          msgRecallTime={msgRecallTime}
          settingActions={p2pSettingActions}
          msgOperMenu={msgOperMenu}
          onMessageItemAvatarClick={onMessageItemAvatarClick}
          renderP2pCustomMessage={renderP2pCustomMessage}
          renderHeader={renderHeader}
          renderP2pInputPlaceHolder={renderP2pInputPlaceHolder}
          renderMessageAvatar={renderMessageAvatar}
          renderMessageName={renderMessageName}
          renderMessageInnerContent={renderMessageInnerContent}
          renderMessageOuterContent={renderMessageOuterContent}
          strangerTipVisible={strangerTipVisible}
          scrollIntoMode={scrollIntoMode}
          enableSendVideo={enableSendVideo}
        />
      ) : conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ? (
        <TeamChatContainer
          prefix={prefix}
          commonPrefix={commonPrefix}
          maxUploadFileSize={maxUploadFileSize}
          conversationType={conversationType}
          receiverId={receiverId}
          onSendText={onSendText}
          actions={actions}
          msgRecallTime={msgRecallTime}
          settingActions={teamSettingActions}
          msgOperMenu={msgOperMenu}
          onMessageItemAvatarClick={onMessageItemAvatarClick}
          afterTransferTeam={afterTransferTeam}
          renderTeamCustomMessage={renderTeamCustomMessage}
          renderHeader={renderHeader}
          renderTeamInputPlaceHolder={renderTeamInputPlaceHolder}
          renderTeamMemberItem={renderTeamMemberItem}
          renderMessageAvatar={renderMessageAvatar}
          renderMessageName={renderMessageName}
          renderMessageInnerContent={renderMessageInnerContent}
          renderMessageOuterContent={renderMessageOuterContent}
          scrollIntoMode={scrollIntoMode}
          enableSendVideo={enableSendVideo}
        />
      ) : null
    ) : renderEmpty ? (
      renderEmpty()
    ) : (
      <Welcome prefix={commonPrefix} />
    )
  }
)
