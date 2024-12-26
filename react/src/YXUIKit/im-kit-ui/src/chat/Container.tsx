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
import { GroupItemProps } from './components/ChatTeamSetting/GroupItem'
import { MenuItem } from './components/ChatMessageItem'
import { SettingActionItemProps } from './components/ChatActionBar'

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
    是否显示该按钮，自带按钮默认 true，新增自定义按钮默认 false
    */
  visible?: boolean
  /**
    自定义渲染，如果不传则使用默认渲染方式
    */
  render?: (props: ActionRenderProps) => ReactNode
}

export interface MsgOperMenuItem extends MenuItem {
  onClick?: (msg: IMMessage) => void
}

export interface ChatSettingActionItem extends SettingActionItemProps {
  onClick?: () => void
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
    scene: TMsgScene
    to: string
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
  /**
    是否展示陌生人提示
  */
  strangerTipVisible?: boolean

  /**
    上拉加载消息滚动模式，组件在上拉加载消息时，默认会自动滚动到最新的消息，当组件位于可滚动的页面中时，可能会造成滚动异常，设置nearest即可
  */
  scrollIntoMode?: 'nearest'
}

export const ChatContainer: React.FC<ChatContainerProps> = observer(
  ({
    selectedSession,
    actions,
    p2pSettingActions,
    teamSettingActions,
    msgOperMenu,
    scrollIntoMode,
    strangerTipVisible = true,
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
          onSendText={onSendText}
          actions={actions}
          scrollIntoMode={scrollIntoMode}
          settingActions={p2pSettingActions}
          msgOperMenu={msgOperMenu}
          strangerTipVisible={strangerTipVisible}
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
          onSendText={onSendText}
          scrollIntoMode={scrollIntoMode}
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
