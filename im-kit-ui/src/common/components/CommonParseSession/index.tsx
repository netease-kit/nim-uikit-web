import React, { useEffect, useRef, useState } from 'react'
import { Dropdown, Image, Popover, Progress, Tooltip, message } from 'antd'
import reactStringReplace from 'react-string-replace'
import CommonIcon from '../CommonIcon'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github.css'
import {
  getFileType,
  parseFileSize,
  debounce,
  addUrlSearch,
} from '@xkit-yx/utils'
import {
  getAIErrorMap,
  getDownloadUrl,
  handleEmojiTranslate,
  logger,
  EMOJI_ICON_MAP_CONFIG,
} from '../../../utils'
import {
  V2NIMMessage,
  V2NIMMessageImageAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageAudioAttachment,
  V2NIMMessageLocationAttachment,
  V2NIMMessageVideoAttachment,
  V2NIMMessageNotificationAttachment,
} from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import { useTranslation, useStateContext } from '../../index'
import { observer } from 'mobx-react'
import { getBlobImg } from '../../../urlToBlob'
import {
  V2NIMMessageForUI,
  YxServerExt,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { V2NIMError } from 'nim-web-sdk-ng/dist/esm/nim/src/types'
import { AI_SEARCH_MENU_KEY, fileIconMap } from '../../../constant'
import Markdown from 'react-markdown'
import { LoadingOutlined } from '@ant-design/icons'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'

import 'highlight.js/styles/github-dark.css' // 选择高亮主题

// 在文件顶部引入
// import { useTypewriterEffect } from '../../hooks/useTypewriterEffect'
export interface IParseSessionProps {
  prefix?: string
  msg: V2NIMMessageForUI
  replyMsg?: V2NIMMessage
  needTextTooltop?: boolean
  showThreadReply?: boolean
  onReeditClick?: (msg: V2NIMMessageForUI) => void
}

export const pauseAllAudio = (): HTMLAudioElement => {
  const audio = document.getElementById('yx-audio-message') as HTMLAudioElement

  audio?.pause()
  return audio
}

export const pauseOtherVideo = (idClient: string): void => {
  const videoElements = document.getElementsByTagName('video')

  Array.from(videoElements).forEach((item) => {
    if (item.id !== `msg-video-${idClient}`) {
      item.pause()
    }
  })
}

export const pauseAllVideo = (): void => {
  const videoElements = document.getElementsByTagName('video')

  Array.from(videoElements).forEach((item) => {
    if (item.id.startsWith('msg-video-')) {
      item.pause()
    }
  })
}

export const getMsgContentTipByType = (
  msg: Pick<V2NIMMessage, 'messageType' | 'text'>,
  t
): string | React.ReactNode => {
  const { messageType, text } = msg

  switch (messageType) {
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT: {
      const { INPUT_EMOJI_SYMBOL_REG } = handleEmojiTranslate(t)

      return reactStringReplace(text, INPUT_EMOJI_SYMBOL_REG, (match, i) => {
        return (
          <CommonIcon
            key={match + i}
            style={{ fontSize: '18px' }}
            type={EMOJI_ICON_MAP_CONFIG[match]}
          />
        )
      })
    }

    // case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM:
    //   return text || `[${t('customMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
      return `[${t('audioMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
      return `[${t('fileMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL:
      return `[${t('callMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
      return `[${t('geoMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
      return `[${t('imgMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION:
      return `[${t('notiMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_ROBOT:
      return `[${t('robotMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS:
      return `[${t('tipMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
      return `[${t('videoMsgText')}]`
    default:
      return `[${t('notSupportMessageText')}]`
  }
}

export const ParseSession: React.FC<IParseSessionProps> = observer(
  ({
    prefix = 'common',
    msg,
    replyMsg,
    needTextTooltop = false,
    showThreadReply = false,
    onReeditClick,
  }) => {
    const _prefix = `${prefix}-parse-session`
    const { nim, store, localOptions } = useStateContext()
    const { t } = useTranslation()
    const locationDomRef = useRef<HTMLDivElement | null>(null)
    const audioContainerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const notSupportMessageText = t('notSupportMessageText')
    const [audioIconType, setAudioIconType] = useState('icon-yuyin3')
    const [imgUrl, setImgUrl] = useState('')
    const [replyImgUrl, setReplyImgUrl] = useState('')
    const [threadReply, setThreadReply] = useState<V2NIMMessage | 'noFind'>()
    const [aiSearchText, setAiSearchText] = useState('')

    const aiSearchDropdownContainerRef = useRef<HTMLDivElement>(null)

    const myAccount = store.userStore.myUserInfo.accountId

    const { INPUT_EMOJI_SYMBOL_REG } = handleEmojiTranslate(t)

    const aiSearchUser = store.aiUserStore.getAISearchUser()

    let storeMsg: V2NIMMessageForUI | void = void 0

    if (msg.threadReply) {
      storeMsg = store.msgStore.getMsg(msg.threadReply.conversationId, [
        msg.threadReply.messageClientId,
      ])[0]
    }

    const aiErrorMap = getAIErrorMap(t)

    useEffect(() => {
      if (
        msg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE &&
        msg.attachment &&
        (msg.attachment as V2NIMMessageImageAttachment).url
      ) {
        const url = getDownloadUrl(msg)

        getBlobImg(url).then((blobUrl) => {
          setImgUrl(blobUrl)
        })
      }
    }, [msg])

    useEffect(() => {
      if (
        replyMsg &&
        replyMsg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE &&
        replyMsg.attachment &&
        (replyMsg.attachment as V2NIMMessageImageAttachment).url
      ) {
        const url = getDownloadUrl(replyMsg)

        getBlobImg(url).then((blobUrl) => {
          setReplyImgUrl(blobUrl)
        })
      }
    }, [replyMsg])

    useEffect(() => {
      if (msg.threadReply) {
        if (storeMsg) {
          setThreadReply(storeMsg)
        } else {
          nim.V2NIMMessageService.getMessageListByRefers([msg.threadReply])
            .then((res) => {
              logger.log('获取 threadReply 成功', res)
              if (res[0]) {
                setThreadReply(store.msgStore.handleReceiveAIMsg(res[0]))
              } else {
                setThreadReply('noFind')
              }
            })
            .catch((err) => {
              setThreadReply('noFind')
              logger.error(
                '获取 threadReply 失败',
                (err as V2NIMError).toString()
              )
            })
        }
      }
    }, [nim.V2NIMMessageService, msg.threadReply, store.msgStore, storeMsg])

    useEffect(() => {
      const handleOtherClick = () => {
        setAiSearchText('')
      }

      document.addEventListener('click', handleOtherClick)

      return () => {
        document.removeEventListener('click', handleOtherClick)
      }
    }, [])

    let animationFlag = false

    const teamId =
      msg.conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ? nim.V2NIMConversationIdUtil.parseConversationTargetId(
            msg.conversationId
          )
        : ''

    const handleOnMouseUp = debounce(() => {
      const selection = window.getSelection()
      const text = selection?.toString()?.trim()

      setAiSearchText(text || '')
    }, 100)

    const handleMenuClick = async ({ key }: { key: string }) => {
      if (key === AI_SEARCH_MENU_KEY && aiSearchUser) {
        try {
          await store.aiUserStore.sendAIProxyActive({
            accountId: aiSearchUser.accountId,
            requestId: Math.random().toString(36).slice(2),
            content: { msg: aiSearchText, type: 0 },
            onSendAIProxyErrorHandler: (code: number) => {
              const errorText = aiErrorMap[code] || t('aiProxyFailedText')

              message.error(errorText)
            },
            aiStream: localOptions.aiStream as boolean,
          })
        } catch (error) {
          logger.error('AI 划词搜失败', (error as V2NIMError).toString())
        }
      }
    }

    const getUserInfo = (account: string) => {
      if (
        !account ||
        msg.conversationType !==
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ||
        store.userStore.users.has(account) ||
        store.aiUserStore.aiUsers.has(account)
      ) {
        return
      }

      store.userStore.getUserActive(account)
    }

    const playAudioAnimation = () => {
      animationFlag = true
      let audioIcons = ['icon-yuyin1', 'icon-yuyin2', 'icon-yuyin3']
      const handler = () => {
        const icon = audioIcons.shift()

        if (icon) {
          setAudioIconType(icon)
          if (!audioIcons.length && animationFlag) {
            audioIcons = ['icon-yuyin1', 'icon-yuyin2', 'icon-yuyin3']
          }

          if (audioIcons.length) {
            setTimeout(handler, 300)
          }
        }
      }

      handler()
    }

    const renderAiSteamMsg = (msg: V2NIMMessageForUI) => {
      const aiStreamStatus = msg?.aiConfig?.aiStreamStatus

      switch (aiStreamStatus) {
        case V2NIMConst.V2NIMMessageAIStreamStatus
          .NIM_MESSAGE_AI_STREAM_STATUS_PLACEHOLDER:
          return <LoadingOutlined style={{ color: '#666666' }} />

        case V2NIMConst.V2NIMMessageAIStreamStatus
          .NIM_MESSAGE_AI_STREAM_STATUS_EXCEPTION:
          return <div>{t('aiErrorText')}</div>

        default:
          return (
            <Markdown
              // 支持表格
              //@ts-ignore
              remarkPlugins={[remarkGfm]}
              //@ts-ignore
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {msg.text || ''}
            </Markdown>
          )
      }
    }

    const renderCustomText = (msg: V2NIMMessageForUI, isReplyMsg: boolean) => {
      const isAiMessage =
        msg.aiConfig?.aiStatus ===
        V2NIMConst.V2NIMMessageAIStatus.V2NIM_MESSAGE_AI_STATUS_RESPONSE

      if (isAiMessage) {
        // needTextTooltip 用于置顶消息的展示
        if (needTextTooltop) {
          return (
            <Tooltip
              overlayClassName={`${_prefix}-ai-text-tool-tip-wrapper`}
              title={
                <div ref={textRef} className={`${_prefix}-text-wrapper`}>
                  <div
                    className={`${_prefix}-text-wrapper ${_prefix}-ai-text ${_prefix}-ai-text-tool-tip`}
                  >
                    {renderAiSteamMsg(msg)}
                  </div>
                </div>
              }
              trigger={'click'}
              placement="bottom"
              color="#ffffff"
              className={`${_prefix}-top-text-tooltip`}
              getPopupContainer={() => textRef.current || document.body}
            >
              <div ref={textRef} className={`${_prefix}-text-wrapper`}>
                <div className={`${_prefix}-text-wrapper ${_prefix}-ai-text`}>
                  {renderAiSteamMsg(msg)}
                </div>
              </div>
            </Tooltip>
          )
        }

        return (
          <Dropdown
            open={
              !store.aiUserStore.isAISearching() &&
              localOptions.aiVisible &&
              !!aiSearchUser &&
              store &&
              !isReplyMsg
                ? !!aiSearchText
                : false
            }
            menu={{
              items: [
                {
                  label: t('aiSearchText'),
                  key: AI_SEARCH_MENU_KEY,
                  icon: <CommonIcon type="icon-a-123" size={16} />,
                },
              ],
              onClick: handleMenuClick,
            }}
            getPopupContainer={(triggerNode) =>
              aiSearchDropdownContainerRef.current || triggerNode
            }
          >
            <div
              onMouseUp={handleOnMouseUp}
              className={`${_prefix}-text-wrapper ${_prefix}-ai-text`}
              ref={aiSearchDropdownContainerRef}
            >
              {renderAiSteamMsg(msg)}
            </div>
          </Dropdown>
        )
      }

      const { text, messageClientId, serverExtension } = msg

      let finalText = reactStringReplace(
        text,
        /(https?:\/\/\S+)/gi,
        (match, i) => (
          <a
            key={messageClientId + match + i}
            href={match}
            target="_blank"
            rel="noreferrer"
          >
            {match}
          </a>
        )
      )

      finalText = reactStringReplace(
        finalText,
        INPUT_EMOJI_SYMBOL_REG,
        (match, i) => {
          return (
            <CommonIcon
              key={messageClientId + match + i}
              className={`${_prefix}-emoji-icon`}
              type={EMOJI_ICON_MAP_CONFIG[match]}
            />
          )
        }
      )
      if (serverExtension) {
        try {
          const extObj: YxServerExt = JSON.parse(serverExtension)
          const yxAitMsg = extObj.yxAitMsg

          if (yxAitMsg && localOptions.needMention) {
            Object.keys(yxAitMsg).forEach((key) => {
              const item = yxAitMsg[key]

              finalText = reactStringReplace(
                finalText,
                item.text,
                (match, i) => {
                  return (
                    <span
                      key={messageClientId + match + i}
                      className={`${_prefix}-mention`}
                    >
                      {match}
                    </span>
                  )
                }
              )
            })
          }
        } catch {
          //
        }
      }

      // 置顶消息时使用，点击展开消息
      if (needTextTooltop) {
        return (
          <Tooltip
            title={finalText}
            trigger={'click'}
            placement="bottom"
            color="#ffffff"
            className={`${_prefix}-top-text-tooltip`}
            getPopupContainer={() => textRef.current || document.body}
          >
            <div ref={textRef} className={`${_prefix}-text-wrapper`}>
              {finalText}
            </div>
          </Tooltip>
        )
      }

      return (
        <Dropdown
          open={
            !store.aiUserStore.isAISearching() &&
            localOptions.aiVisible &&
            !!aiSearchUser &&
            store &&
            !isReplyMsg
              ? !!aiSearchText
              : false
          }
          menu={{
            items: [
              {
                label: t('aiSearchText'),
                key: AI_SEARCH_MENU_KEY,
                icon: <CommonIcon type="icon-a-123" size={16} />,
              },
            ],
            onClick: handleMenuClick,
          }}
          getPopupContainer={(triggerNode) => textRef.current || triggerNode}
        >
          <div
            ref={textRef}
            className={`${_prefix}-text-wrapper`}
            onMouseUp={handleOnMouseUp}
          >
            {finalText}
          </div>
        </Dropdown>
      )
    }

    const renderUploadMsg = (msg: V2NIMMessageForUI) => {
      const { uploadProgress, previewImg, sendingState } = msg

      return (
        <div className={`${_prefix}-upload-container`}>
          <img
            className={`${_prefix}-upload-img`}
            src={
              previewImg ||
              'https://yx-web-nosdn.netease.im/common/33d3e1fa8de771277ea4466564ef37aa/emptyImg.png'
            }
          />
          {sendingState ===
            V2NIMConst.V2NIMMessageSendingState
              .V2NIM_MESSAGE_SENDING_STATE_SENDING &&
          uploadProgress !== void 0 &&
          uploadProgress < 100 ? (
            <div className={`${_prefix}-upload-mask`}>
              <div
                className={`${_prefix}-upload-progress`}
                onClick={() => {
                  store.msgStore
                    .cancelMessageAttachmentUploadActive(msg)
                    .catch(() => {
                      message.error(t('cancelUploadFailedText'))
                    })
                }}
              >
                <Progress
                  type="circle"
                  status="exception"
                  percent={uploadProgress || 0}
                  width={40}
                  strokeColor="#899095"
                  trailColor="rgba(0,0,0,0.5)"
                />
              </div>
            </div>
          ) : null}
        </div>
      )
    }

    const renderImage = (msg: V2NIMMessageForUI, isReplyMsg: boolean) => {
      const { uploadProgress } = msg
      const attachment = msg.attachment as V2NIMMessageImageAttachment

      // 上传中或没有真实 url 时走这里
      if (
        (uploadProgress !== void 0 && uploadProgress < 100) ||
        !attachment.url
      ) {
        return renderUploadMsg(msg)
      }

      return (
        <div
          className={`${_prefix}-image-container`}
          onContextMenu={(e) => {
            // @ts-ignore
            if (!(e.target.className || '').includes('-image-mask')) {
              e.stopPropagation()
            }
          }}
        >
          <Image
            rootClassName={`${_prefix}-image`}
            loading="lazy"
            src={
              isReplyMsg ? replyImgUrl : imgUrl
              // ||
              // 'https://yx-web-nosdn.netease.im/common/33d3e1fa8de771277ea4466564ef37aa/emptyImg.png'
            }
          />
        </div>
      )
    }

    const renderFile = (msg: V2NIMMessageForUI) => {
      let downloadHref = ''

      try {
        downloadHref = addUrlSearch(
          (msg.attachment as V2NIMMessageFileAttachment)?.url,
          `download=${(msg.attachment as V2NIMMessageFileAttachment)?.name}`
        )
      } catch (error) {
        //
      }

      return (
        <div className={`${_prefix}-file-box`}>
          <CommonIcon
            className={`${_prefix}-file-icon`}
            type={
              fileIconMap[
                getFileType((msg.attachment as V2NIMMessageFileAttachment)?.ext)
              ] || 'icon-weizhiwenjian'
            }
          />
          <div className={`${_prefix}-file-info`}>
            {downloadHref ? (
              <a
                download={(msg.attachment as V2NIMMessageFileAttachment)?.name}
                href={downloadHref}
                target="_blank"
                rel="noreferrer"
              >
                {(msg.attachment as V2NIMMessageFileAttachment)?.name}
              </a>
            ) : (
              <span>
                {(msg.attachment as V2NIMMessageFileAttachment)?.name}
              </span>
            )}
            <span>
              {parseFileSize(
                (msg.attachment as V2NIMMessageFileAttachment)?.size
              )}
            </span>
          </div>
        </div>
      )
    }

    const renderNotification = (msg: V2NIMMessageForUI) => {
      const attachment = msg.attachment as V2NIMMessageNotificationAttachment

      switch (attachment?.type) {
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_UPDATE_TINFO: {
          const team: V2NIMTeam = (attachment?.updatedTeamInfo ||
            {}) as V2NIMTeam
          const content: string[] = []

          if (team.avatar !== void 0) {
            content.push(t('updateTeamAvatar'))
          }

          if (team.name !== void 0) {
            content.push(`${t('updateTeamName')}“${team.name}”`)
          }

          if (team.intro !== void 0) {
            content.push(t('updateTeamIntro'))
          }

          if (team.inviteMode !== void 0) {
            content.push(
              `${t('updateTeamInviteMode')}“${
                team.inviteMode ===
                V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
                  ? t('teamAll')
                  : localOptions.teamManagerVisible
                  ? t('teamOwnerAndManagerText')
                  : t('onlyTeamOwner')
              }”`
            )
          }

          if (team.updateInfoMode !== void 0) {
            content.push(
              `${t('updateTeamUpdateTeamMode')}“${
                team.updateInfoMode ===
                V2NIMConst.V2NIMTeamUpdateInfoMode
                  .V2NIM_TEAM_UPDATE_INFO_MODE_ALL
                  ? t('teamAll')
                  : localOptions.teamManagerVisible
                  ? t('teamOwnerAndManagerText')
                  : t('onlyTeamOwner')
              }”`
            )
          }

          if (team.chatBannedMode !== void 0) {
            content.push(
              `${t('updateTeamMute')}${
                team.chatBannedMode ===
                V2NIMConst.V2NIMTeamChatBannedMode
                  .V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
                  ? t('closeText')
                  : t('openText')
              }`
            )
          }

          if (team.serverExtension !== void 0) {
            let ext: YxServerExt = {}

            try {
              ext = JSON.parse(team.serverExtension)
            } catch (error) {
              //
            }

            if (ext.lastOpt === 'yxAllowTop' && ext.yxAllowTop !== void 0) {
              content.push(
                `${t('updateAllowTop')}“${
                  ext.yxAllowTop === 'manager'
                    ? localOptions.teamManagerVisible
                      ? t('teamOwnerAndManagerText')
                      : t('onlyTeamOwner')
                    : t('teamAll')
                }”`
              )
            } else if (
              ext.lastOpt === 'yxMessageTop' &&
              ext.yxMessageTop !== void 0
            ) {
              content.push(
                ext.yxMessageTop.operation === 0
                  ? t('addMessageTop')
                  : t('removeMessageTop')
              )
            } else if (ext.yxAllowAt !== void 0) {
              content.push(
                `${t('updateAllowAt')}“${
                  ext.yxAllowAt === 'manager'
                    ? localOptions.teamManagerVisible
                      ? t('teamOwnerAndManagerText')
                      : t('onlyTeamOwner')
                    : t('teamAll')
                }”`
              )
            }
          }

          getUserInfo(msg.senderId)
          return content.length ? (
            <div className={`${_prefix}-noti`}>
              {store.uiStore.getAppellation({
                account: msg.senderId,
                teamId,
              })}{' '}
              {content.join('、')}
            </div>
          ) : null
        }

        // 申请加入群聊成功
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_APPLY_PASS: {
          const accounts: string[] = attachment?.targetIds || []
          const nicks = accounts
            .map((item) => {
              getUserInfo(item)
              return store.uiStore.getAppellation({
                account: item,
                teamId,
              })
            })
            .filter((item) => !!item)
            .join('、')

          return (
            <div className={`${_prefix}-noti`}>
              {nicks} {t('joinTeamText')}
            </div>
          )
        }

        // 邀请加入群聊对方同意
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE_ACCEPT: {
          getUserInfo(msg.senderId)
          return (
            <div className={`${_prefix}-noti`}>
              {store.uiStore.getAppellation({
                account: msg.senderId,
                teamId,
              })}{' '}
              {t('joinTeamText')}
            </div>
          )
        }

        // 邀请加入群聊无需验证
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE: {
          const accounts: string[] = attachment?.targetIds || []
          const nicks = accounts
            .map((item) => {
              getUserInfo(item)
              return store.uiStore.getAppellation({
                account: item,
                teamId,
              })
            })
            .filter((item) => !!item)
            .join('、')

          return (
            <div className={`${_prefix}-noti`}>
              {nicks} {t('joinTeamText')}
            </div>
          )
        }

        // 踢出群聊
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_KICK: {
          const accounts: string[] = attachment?.targetIds || []
          const nicks = accounts
            .map((item) => {
              getUserInfo(item)
              return store.uiStore.getAppellation({
                account: item,
                teamId,
              })
            })
            .filter((item) => !!item)
            .join('、')

          return (
            <div className={`${_prefix}-noti`}>
              {nicks} {t('beRemoveTeamText')}
            </div>
          )
        }

        // 增加群管理员
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_ADD_MANAGER: {
          const accounts: string[] = attachment?.targetIds || []
          const nicks = accounts
            .map((item) => {
              getUserInfo(item)
              return store.uiStore.getAppellation({
                account: item,
                teamId,
              })
            })
            .filter((item) => !!item)
            .join('、')

          return (
            <div className={`${_prefix}-noti`}>
              {nicks} {t('beAddTeamManagersText')}
            </div>
          )
        }

        // 移除群管理员
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_REMOVE_MANAGER: {
          const accounts: string[] = attachment?.targetIds || []
          const nicks = accounts
            .map((item) => {
              getUserInfo(item)
              return store.uiStore.getAppellation({
                account: item,
                teamId,
              })
            })
            .filter((item) => !!item)
            .join('、')

          return (
            <div className={`${_prefix}-noti`}>
              {nicks} {t('beRemoveTeamManagersText')}
            </div>
          )
        }

        // 主动退出群聊
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_LEAVE: {
          getUserInfo(msg.senderId)
          return (
            <div className={`${_prefix}-noti`}>
              {store.uiStore.getAppellation({
                account: msg.senderId,
                teamId,
              })}{' '}
              {t('leaveTeamText')}
            </div>
          )
        }

        // 转让群主
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_OWNER_TRANSFER: {
          getUserInfo((attachment?.targetIds || [])[0])
          return (
            <div className={`${_prefix}-noti`}>
              <span className={`${_prefix}-noti-transfer`}>
                {store.uiStore.getAppellation({
                  account: (attachment?.targetIds || [])[0],
                  teamId,
                })}
              </span>
              {t('newGroupOwnerText')}
            </div>
          )
        }

        default:
          return null
      }
    }

    // 撤回消息相关，重新编辑消息、'xxx 撤回了一条消息'
    const renderSpecialMsg = () => {
      return (
        <div key={msg.messageClientId} className={`${_prefix}-recall`}>
          {msg.recallType === 'reCallMsg' ? (
            <>
              {`${t('you')}${t('recallMessageText')}`}
              {msg.canEdit ? (
                <span
                  className={`${_prefix}-reedit`}
                  onClick={() => onReeditClick?.(msg)}
                >
                  {t('reeditText')}
                </span>
              ) : null}
            </>
          ) : (
            `${
              msg.isSelf
                ? t('you')
                : store.uiStore.getAppellation({
                    account: msg.senderId,
                    teamId:
                      msg.conversationType ===
                      V2NIMConst.V2NIMConversationType
                        .V2NIM_CONVERSATION_TYPE_TEAM
                        ? msg.receiverId
                        : undefined,
                  })
            } ${t('recallMessageText')}`
          )}
        </div>
      )
    }

    // 渲染 AI 消息
    const renderTipAI = (errorCode?: number) => {
      const tip = aiErrorMap[errorCode || 0]

      if (!tip) {
        return null
      }

      return (
        <div key={msg.messageClientId} className={`${_prefix}-tip`}>
          {tip}
        </div>
      )
    }

    // 渲染音频消息
    const renderAudio = (
      msg: V2NIMMessageForUI,
      shouldRenderTextOfVoice = true
    ) => {
      const attachment = msg.attachment as V2NIMMessageAudioAttachment
      const duration = Math.floor(attachment?.duration / 1000) || 0

      const containerWidth = 80 + 15 * (duration - 1)

      return (
        <div
          className={`${_prefix}-audio-container`}
          style={
            shouldRenderTextOfVoice && msg.textOfVoice
              ? {}
              : { width: containerWidth }
          }
          ref={audioContainerRef}
        >
          <div
            className={
              msg.senderId === myAccount
                ? `${_prefix}-audio-out`
                : `${_prefix}-audio-in`
            }
            onClick={() => {
              pauseAllVideo()
              const oldAudio = pauseAllAudio()
              const msgId = oldAudio?.getAttribute('msgId')

              // 如果是自己，暂停动画
              if (msgId === msg.messageClientId) {
                animationFlag = false
                return
              }

              const audio = new Audio(attachment?.url)

              // 播放音频，并开始动画
              audio.id = 'yx-audio-message'
              audio.setAttribute('msgId', msg.messageClientId)
              audio.play()
              audioContainerRef.current?.appendChild(audio)
              audio.addEventListener('ended', () => {
                animationFlag = false
                audio.parentNode?.removeChild(audio)
              })
              audio.addEventListener('pause', () => {
                animationFlag = false
                audio.parentNode?.removeChild(audio)
              })
              playAudioAnimation()
            }}
          >
            {duration}s
            <span className={`${_prefix}-audio-icon-wrapper`}>
              {/* 这里是动画 */}
              <CommonIcon type={audioIconType} />
            </span>
          </div>
          {shouldRenderTextOfVoice && msg.textOfVoice && (
            <div className={`${_prefix}-audio-text`}>{msg.textOfVoice}</div>
          )}
        </div>
      )
    }

    // 渲染视频消息
    const renderVideo = (msg: V2NIMMessageForUI) => {
      const uploadProgress = msg.uploadProgress
      const attachment = msg.attachment as V2NIMMessageVideoAttachment

      let url = attachment.url

      if (attachment.file && !url) {
        try {
          url = URL.createObjectURL(attachment.file)
        } catch (error) {
          logger.warn('createObjectURL fail: ', attachment)
        }
      }

      // 上传中或没有真实 url 时走这里
      if ((uploadProgress !== void 0 && uploadProgress < 100) || !url) {
        return renderUploadMsg(msg)
      }

      url = url.startsWith('blob:') ? url : getDownloadUrl(msg)
      return (
        <video
          src={url}
          id={`msg-video-${msg.messageClientId}`}
          className={`${_prefix}-video`}
          controls
          onPlay={() => {
            // 播放视频，暂停其他视频和音频
            pauseOtherVideo(msg.messageClientId)
            pauseAllAudio()
          }}
          onError={() => {
            // 处理异常 例如：视频格式不支持播放等
          }}
        />
      )
    }

    // 渲染地理位置消息
    const renderLocation = (msg: V2NIMMessageForUI) => {
      const attachment = msg.attachment as V2NIMMessageLocationAttachment
      const text = msg.text
      const amapUrl = `https://uri.amap.com/marker?position=${attachment?.longitude},${attachment?.latitude}&name=${text}`
      const txmapUrl = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${attachment?.latitude},${attachment?.longitude};title:${text};addr:${attachment?.address}&referer=myapp`
      const bdmapUrl = `http://api.map.baidu.com/marker?location=${attachment?.latitude},${attachment?.longitude}&title=${text}&content=${attachment?.address}&output=html&coord_type=gcj02&src=myapp`
      const menu = (
        <div className={`${_prefix}-map-menu`}>
          <div>
            <a target="_blank" rel="noopener noreferrer" href={amapUrl}>
              {t('amap')}
            </a>
          </div>
          <div>
            <a target="_blank" rel="noopener noreferrer" href={txmapUrl}>
              {t('txmap')}
            </a>
          </div>
          <div>
            <a target="_blank" rel="noopener noreferrer" href={bdmapUrl}>
              {t('bdmap')}
            </a>
          </div>
        </div>
      )

      return (
        <Popover
          content={menu}
          trigger={['click']}
          overlayClassName={`${_prefix}-map-menu-popover`}
          getPopupContainer={(triggerNode) =>
            locationDomRef.current || triggerNode
          }
        >
          <div className={`${_prefix}-location-card`} ref={locationDomRef}>
            <div className={`${_prefix}-location-title`}>{text}</div>
            <div className={`${_prefix}-location-subTitle`}>
              {attachment?.address}
            </div>
            <img
              src="https://yx-web-nosdn.netease.im/common/00685d88b3d4bead5e95479408b5b30f/map.png"
              alt=""
            />
          </div>
        </Popover>
      )
    }

    const renderNotSupportMessage = () => {
      return (
        <div className={`${_prefix}-text-wrapper`}>
          {`[${notSupportMessageText}]`}
        </div>
      )
    }

    // 渲染回复消息
    const renderReplyMsg = () => {
      if (showThreadReply && threadReply) {
        return finalRenderReplyMsg(threadReply)
      }

      if (replyMsg) {
        return finalRenderReplyMsg(replyMsg)
      }

      return null
    }

    const finalRenderReplyMsg = (reply: V2NIMMessage | 'noFind') => {
      if (reply === 'noFind') {
        return (
          <div
            className={`${_prefix}-reply-wrapper`}
            onClick={() => {
              // 滚动到回复的消息
              // document.getElementById(replyMsg.idClient)?.scrollIntoView()
            }}
          >
            {t('recallReplyMessageText')}
          </div>
        )
      }

      const isAiResponseMessage =
        reply?.aiConfig?.aiStatus ===
        V2NIMConst.V2NIMMessageAIStatus.V2NIM_MESSAGE_AI_STATUS_RESPONSE

      const renderSenderId = isAiResponseMessage
        ? reply?.aiConfig?.accountId
        : reply.senderId

      const nick = store.uiStore.getAppellation({
        account: renderSenderId as string,
        teamId,
        ignoreAlias: true,
      })

      return (
        <div
          className={`${_prefix}-reply-wrapper`}
          onClick={() => {
            // 滚动到回复的消息
            // document.getElementById(replyMsg.idClient)?.scrollIntoView()
          }}
        >
          <div className={`${_prefix}-reply-nick`}>{nick}：</div>
          {renderMsgContent(reply, true)}
        </div>
      )
    }

    const renderMsgContent = (msg: V2NIMMessageForUI, isReplyMsg: boolean) => {
      if (msg.recallType === 'reCallMsg' || msg.recallType === 'beReCallMsg') {
        return renderSpecialMsg()
      }

      switch (msg.messageType) {
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
          getUserInfo(msg.senderId)
          return renderCustomText(msg, isReplyMsg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
          getUserInfo(msg.senderId)
          return renderImage(msg, isReplyMsg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
          getUserInfo(msg.senderId)
          return renderFile(msg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION:
          return renderNotification(msg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
          getUserInfo(msg.senderId)
          // 回复的语音消息应测试要求不要渲染转文字内容
          return renderAudio(msg, !isReplyMsg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL:
          return `[${t('callMsgText')}，${notSupportMessageText}]`
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
          getUserInfo(msg.senderId)
          return renderLocation(msg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_ROBOT:
          return `[${t('robotMsgText')}，${notSupportMessageText}]`
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS:
          if (
            Object.keys(aiErrorMap)
              .map((item) => Number(item))
              .includes(msg.messageStatus.errorCode)
          ) {
            return renderTipAI(msg.messageStatus.errorCode)
          }

          return `[${t('tipMsgText')}，${notSupportMessageText}]`
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
          getUserInfo(msg.senderId)
          return renderVideo(msg)
        default:
          return renderNotSupportMessage()
      }
    }

    return (
      <>
        {renderReplyMsg()}
        {renderMsgContent(msg, false)}
      </>
    )
  }
)
