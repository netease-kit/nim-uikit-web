import React, { Fragment, useRef } from 'react'
import { Dropdown, Menu, Tooltip } from 'antd'
import {
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons'
import classNames from 'classnames'
import moment from 'moment'
import {
  ParseSession,
  ComplexAvatarContainer,
  MyAvatarContainer,
  useTranslation,
  CommonIcon,
  useStateContext,
} from '../../../common'
import { RollbackOutlined, DeleteOutlined } from '@ant-design/icons'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { observer } from 'mobx-react'
import { MsgOperMenuItem } from '../../Container'
import { mergeActions } from '../../../utils'

export type MenuItemKey = 'recall' | 'delete' | 'reply' | 'forward' | string
export type AvatarMenuItem = 'mention'

export interface MenuItem {
  // 是否显示
  show?: 1 | 0
  // 名称
  label?: string
  // 唯一 key
  key: MenuItemKey
  // 图标
  icon?: React.ReactNode
}

export interface MessageItemProps {
  myAccount: string
  msg: IMMessage
  replyMsg?: IMMessage
  normalStatusRenderer?: React.ReactNode
  msgOperMenu?: MsgOperMenuItem[]
  onSendImg: (file: File, randomId?: string) => Promise<void>
  onSendVideo: (file: File, randomId?: string) => Promise<void>
  onResend: (msg: IMMessage) => void
  onReeditClick: (msg: IMMessage) => void
  onMessageAction: (key: MenuItemKey, msg: IMMessage) => void
  onMessageAvatarAction?: (key: AvatarMenuItem, msg: IMMessage) => void
  renderMessageAvatar?: (msg: IMMessage) => JSX.Element | null | undefined
  renderMessageName?: (msg: IMMessage) => JSX.Element | null | undefined
  renderMessageOuterContent?: (msg: IMMessage) => JSX.Element | null | undefined
  renderMessageInnerContent?: (msg: IMMessage) => JSX.Element | null | undefined
  prefix?: string
  commonPrefix?: string
}

export const ChatMessageItem: React.FC<MessageItemProps> = observer(
  ({
    msg,
    replyMsg,
    myAccount,
    normalStatusRenderer,
    msgOperMenu,
    onResend,
    onSendImg,
    onSendVideo,
    onMessageAction,
    onMessageAvatarAction,
    onReeditClick,
    renderMessageAvatar,
    renderMessageName,
    renderMessageOuterContent,
    renderMessageInnerContent,
    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { t } = useTranslation()
    const { store } = useStateContext()

    const _prefix = `${prefix}-message-list-item`

    const {
      from,
      // fromNick,
      body,
      attach,
      idClient,
      status,
      // @ts-ignore
      uploadProgress,
      // @ts-ignore
      uploadFileInfo,
      time,
      type,
      scene,
      to,
    } = msg

    const messageActionDropdownContainerRef = useRef<HTMLDivElement>(null)
    const messageAvatarActionDropdownContainerRef = useRef<HTMLDivElement>(null)

    const isSelf = from === myAccount

    const nick = store.uiStore.getAppellation({
      account: from,
      teamId: scene === 'team' ? to : undefined,
    })

    const nickWithoutAlias = store.uiStore.getAppellation({
      account: from,
      teamId: scene === 'team' ? to : undefined,
      ignoreAlias: true,
    })

    // 内存中插入的 msg 属性，具体内容参考 msg store
    const {
      type: attachType = '',
      canRecall = false,
      canEdit = false,
      oldBody = '',
    } = attach || { type: '', canRecall: false, canEdit: false, oldBody: '' }

    const handleResendMsg = () => {
      // 如果是上传过程中失败的图片和视频消息，则重新发送
      if (uploadFileInfo && ['image', 'video'].includes(msg.type)) {
        switch (msg.type) {
          case 'image':
            onSendImg(uploadFileInfo.file, msg.idClient)
            break
          case 'video':
            onSendVideo(uploadFileInfo.file, msg.idClient)
            break
          default:
            break
        }
      } else {
        onResend(msg)
      }
    }

    const renderSendStatus = () => {
      if (status === 'sending') {
        return <LoadingOutlined className={`${_prefix}-status-icon`} />
      }
      if (status === 'read') {
        return <CheckCircleOutlined className={`${_prefix}-status-icon`} />
      }
      if (status === 'sendFailed') {
        return (
          <Tooltip title={t('sendMsgFailedText')}>
            <ExclamationCircleFilled
              className={`${_prefix}-status-icon-fail`}
              onClick={handleResendMsg}
            />
          </Tooltip>
        )
      }
      if (status === 'refused') {
        return (
          <Tooltip title={t('sendBlackFailedText')}>
            <ExclamationCircleFilled
              className={`${_prefix}-status-icon-fail`}
              onClick={() => onResend(msg)}
            />
          </Tooltip>
        )
      }
      return normalStatusRenderer || null
    }

    const renderMsgDate = () => {
      const date = moment(time)
      const isCurrentDay = date.isSame(moment(), 'day')
      const isCurrentYear = date.isSame(moment(), 'year')
      return isCurrentDay
        ? date.format('HH:mm:ss')
        : isCurrentYear
        ? date.format('MM-DD HH:mm:ss')
        : date.format('YYYY-MM-DD HH:mm:ss')
    }

    const renderMenuItems = () => {
      const defaultMenuItems: MenuItem[] = [
        // {
        //   label: '复制',
        //   key: 'copy',
        //   icon: <CopyOutlined />,
        // },
        {
          show: ['sending', 'sendFailed', 'refused', 'delete'].includes(status)
            ? 0
            : 1,
          label: t('replyText'),
          key: 'reply',
          icon: <CommonIcon type="icon-huifu" />,
        },
        {
          show: uploadProgress === void 0 ? 1 : 0,
          label: t('deleteText'),
          key: 'delete',
          icon: <DeleteOutlined />,
        },
        {
          show:
            ['sending', 'sendFailed', 'refused', 'delete'].includes(status) ||
            type === 'audio'
              ? 0
              : 1,
          label: t('forwardText'),
          key: 'forward',
          icon: <CommonIcon type="icon-zhuanfa" />,
        },
        {
          show: canRecall ? 1 : 0,
          label: t('recallText'),
          key: 'recall',
          icon: <RollbackOutlined />,
        },
      ]
      const menuItems = msgOperMenu
        ? mergeActions(defaultMenuItems, msgOperMenu, 'key')
        : defaultMenuItems
      return menuItems.filter((item) => item.show)
    }

    const renderAvatarMenuItems = () => {
      return [
        {
          // @ts-ignore: 需求导致不需要 群备注
          label: `@${nickWithoutAlias}`,
          key: 'mention',
        },
      ]
    }

    const renderSpecialMsg = () => {
      return (
        <div key={idClient} className={`${_prefix}-recall`}>
          {attachType === 'reCallMsg' ? (
            <>
              {`${t('you')}${t('recallMessageText')}`}
              {canEdit ? (
                <span
                  className={`${_prefix}-reedit`}
                  onClick={() => onReeditClick(msg)}
                >
                  {t('reeditText')}
                </span>
              ) : null}
            </>
          ) : (
            `${isSelf ? t('you') : nick} ${t('recallMessageText')}`
          )}
        </div>
      )
    }

    return attachType === 'reCallMsg' || attachType === 'beReCallMsg' ? (
      renderSpecialMsg()
    ) : type === 'notification' ? (
      <ParseSession replyMsg={replyMsg} msg={msg} prefix={commonPrefix} />
    ) : (
      <div
        className={classNames(`${_prefix}-wrap`, {
          [`${_prefix}-self`]: isSelf,
        })}
      >
        {renderMessageAvatar?.(msg) ?? (
          <div className={`${_prefix}-avatar`}>
            {isSelf ? (
              <MyAvatarContainer prefix={commonPrefix} canClick={false} />
            ) : (
              <Dropdown
                key={idClient}
                trigger={['contextMenu']}
                overlay={
                  onMessageAvatarAction ? (
                    <Menu
                      onClick={({ key }) =>
                        onMessageAvatarAction?.(key as AvatarMenuItem, msg)
                      }
                      items={renderAvatarMenuItems()}
                    />
                  ) : (
                    <Fragment />
                  )
                }
                getPopupContainer={(triggerNode) =>
                  messageAvatarActionDropdownContainerRef.current || triggerNode
                }
              >
                <div
                  className={`${_prefix}-avatar-wrap`}
                  ref={messageAvatarActionDropdownContainerRef}
                >
                  <ComplexAvatarContainer
                    prefix={commonPrefix}
                    account={from}
                  />
                </div>
              </Dropdown>
            )}
          </div>
        )}

        <Dropdown
          key={idClient}
          trigger={['contextMenu']}
          overlay={
            <Menu
              onClick={({ key }) => onMessageAction(key as MenuItemKey, msg)}
              items={renderMenuItems()}
            />
          }
          getPopupContainer={(triggerNode) =>
            messageActionDropdownContainerRef.current || triggerNode
          }
        >
          <div
            className={`${_prefix}-content-box`}
            ref={messageActionDropdownContainerRef}
          >
            {renderMessageName?.(msg) ?? (
              <div className={`${_prefix}-nick`}>{nick}</div>
            )}
            <div className={`${_prefix}-content`}>
              {isSelf && (
                <div className={`${_prefix}-status`}>{renderSendStatus()}</div>
              )}
              {renderMessageOuterContent?.(msg) ?? (
                <div className={`${_prefix}-body`}>
                  {renderMessageInnerContent?.(msg) ?? (
                    <ParseSession
                      replyMsg={replyMsg}
                      msg={msg}
                      prefix={commonPrefix}
                    />
                  )}
                </div>
              )}
            </div>
            <div
              className={classNames(`${_prefix}-date`, {
                [`${_prefix}-date-self`]: isSelf,
              })}
            >
              {renderMsgDate()}
            </div>
          </div>
        </Dropdown>
      </div>
    )
  }
)

export default ChatMessageItem
