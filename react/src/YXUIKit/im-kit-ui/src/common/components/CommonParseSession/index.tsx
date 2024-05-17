import React, { useEffect, useRef, useState } from 'react'
import { Image, Popover, Progress, message } from 'antd'
import reactStringReplace from 'react-string-replace'
import CommonIcon from '../CommonIcon'
import { getFileType, parseFileSize, addUrlSearch } from '@xkit-yx/utils'
import { handleEmojiTranslate, logger } from '../../../utils'
import {
  V2NIMMessage,
  V2NIMMessageImageAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageAudioAttachment,
  V2NIMMessageLocationAttachment,
  V2NIMMessageVideoAttachment,
  V2NIMMessageNotificationAttachment,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMMessageService'
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService'
import { useTranslation, useStateContext } from '../../index'
import { observer } from 'mobx-react'
import { ALLOW_AT, TAllowAt } from '../../../constant'
import { getBlobImg } from '../../../urlToBlob'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng'

// 对话框中要展示的文件icon标识
const fileIconMap = {
  img: 'icon-tupian2',
  pdf: 'icon-PPT',
  word: 'icon-Word',
  excel: 'icon-Excel',
  ppt: 'icon-PPT',
  audio: 'icon-yinle',
  zip: 'icon-RAR1',
  video: 'icon-shipin',
  txt: 'icon-qita',
}

export interface IParseSessionProps {
  prefix?: string
  msg: V2NIMMessageForUI
  replyMsg?: V2NIMMessage
}

export const pauseAllAudio = (): HTMLAudioElement => {
  const audio = document.getElementById('yx-audio-message') as HTMLAudioElement
  audio?.pause()
  return audio
}

export const pauseOtherVideo = (idClient: string): void => {
  const videoElements = document.getElementsByTagName('video')
  for (let i = 0; i < videoElements.length; i++) {
    if (videoElements[i].id !== `msg-video-${idClient}`) {
      videoElements[i].pause()
    }
  }
}

export const pauseAllVideo = (): void => {
  const videoElements = document.getElementsByTagName('video')
  for (let i = 0; i < videoElements.length; i++) {
    if (videoElements[i].id.startsWith('msg-video-')) {
      videoElements[i].pause()
    }
  }
}

export const ParseSession: React.FC<IParseSessionProps> = observer(
  ({ prefix = 'common', msg, replyMsg }) => {
    const _prefix = `${prefix}-parse-session`
    const { nim, store, localOptions } = useStateContext()
    const { t } = useTranslation()
    const locationDomRef = useRef<HTMLDivElement | null>(null)
    const audioContainerRef = useRef<HTMLDivElement>(null)
    const notSupportMessageText = t('notSupportMessageText')
    const [audioIconType, setAudioIconType] = useState('icon-yuyin3')
    const [imgUrl, setImgUrl] = useState('')
    const [replyImgUrl, setReplyImgUrl] = useState('')
    const myAccount = store.userStore.myUserInfo.accountId

    useEffect(() => {
      if (
        msg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE &&
        msg.attachment &&
        (msg.attachment as V2NIMMessageImageAttachment).url
      ) {
        const url = `${
          (msg.attachment as V2NIMMessageImageAttachment).url
        }?download=${(msg.attachment as V2NIMMessageImageAttachment).name}`
        getBlobImg(url).then((blobUrl) => {
          setImgUrl(blobUrl)
        })
      }
    }, [msg.attachment, msg.messageType])

    useEffect(() => {
      if (
        replyMsg &&
        replyMsg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE &&
        replyMsg.attachment &&
        (replyMsg.attachment as V2NIMMessageImageAttachment).url
      ) {
        const url = `${
          (replyMsg.attachment as V2NIMMessageImageAttachment).url
        }?download=${(replyMsg.attachment as V2NIMMessageImageAttachment).name}`
        getBlobImg(url).then((blobUrl) => {
          setReplyImgUrl(blobUrl)
        })
      }
    }, [replyMsg])

    let animationFlag = false

    const teamId =
      msg.conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ? nim.V2NIMConversationIdUtil.parseConversationTargetId(
            msg.conversationId
          )
        : ''

    const { EMOJI_ICON_MAP_CONFIG, INPUT_EMOJI_SYMBOL_REG } =
      handleEmojiTranslate(t)

    const renderCustomText = (msg: V2NIMMessageForUI) => {
      const { text, messageClientId, serverExtension } = msg

      let finalText = reactStringReplace(
        text,
        /(https?:\/\/\S+)/gi,
        (match, i) => (
          <a key={messageClientId + match + i} href={match} target="_blank">
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
          const extObj = JSON.parse(serverExtension)
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
        } catch {}
      }
      return <div className={`${_prefix}-text-wrapper`}>{finalText}</div>
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
      const { uploadProgress, sendingState } = msg
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
            if (!e.target.className.includes('-image-mask')) {
              e.stopPropagation()
            }
          }}
        >
          <Image
            rootClassName={`${_prefix}-image`}
            loading="lazy"
            src={
              (isReplyMsg ? replyImgUrl : imgUrl) ||
              'https://yx-web-nosdn.netease.im/common/33d3e1fa8de771277ea4466564ef37aa/emptyImg.png'
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
            let ext: TAllowAt = {}
            try {
              ext = JSON.parse(team.serverExtension)
            } catch (error) {
              //
            }
            if (ext[ALLOW_AT] !== void 0) {
              content.push(
                `${t('updateAllowAt')}“${
                  ext[ALLOW_AT] === 'manager'
                    ? localOptions.teamManagerVisible
                      ? t('teamOwnerAndManagerText')
                      : t('onlyTeamOwner')
                    : t('teamAll')
                }”`
              )
            }
          }
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
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_APPLY_PASS:
        // 邀请加入群聊对方同意
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE_ACCEPT: {
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

    const renderAudio = (msg: V2NIMMessageForUI) => {
      const attachment = msg.attachment as V2NIMMessageAudioAttachment
      const duration = Math.floor(attachment?.duration / 1000) || 0

      const containerWidth = 80 + 15 * (duration - 1)

      return (
        <div
          className={`${_prefix}-audio-container`}
          style={{ width: containerWidth }}
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
        </div>
      )
    }

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

      url = url.startsWith('blob:')
        ? url
        : `${url}?download=${msg.messageClientId}.${attachment?.ext}`
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

    const renderLocation = (msg: V2NIMMessageForUI) => {
      const attachment = msg.attachment as V2NIMMessageLocationAttachment
      const text = msg.text
      const amapUrl = `https://uri.amap.com/marker?position=${attachment?.lng},${attachment?.lat}&name=${text}`
      const txmapUrl = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${attachment?.lat},${attachment?.lng};title:${text};addr:${attachment?.title}&referer=myapp`
      const bdmapUrl = `http://api.map.baidu.com/marker?location=${attachment?.lat},${attachment?.lng}&title=${text}&content=${attachment?.title}&output=html&coord_type=gcj02&src=myapp`
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
              {attachment?.title}
            </div>
            <img
              src="https://yx-web-nosdn.netease.im/common/00685d88b3d4bead5e95479408b5b30f/map.png"
              alt=""
            />
          </div>
        </Popover>
      )
    }

    const renderReplyMsg = () => {
      if (replyMsg) {
        let content = ''
        // @ts-ignore
        if (replyMsg === 'noFind') {
          content = t('recallReplyMessageText')
        }
        const nick = store.uiStore.getAppellation({
          account: replyMsg.senderId,
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
            {content ? (
              content
            ) : (
              <>
                <div className={`${_prefix}-reply-nick`}>{nick}：</div>
                {renderMsgContent(replyMsg, true)}
              </>
            )}
          </div>
        )
      }
      return null
    }

    const renderMsgContent = (msg: V2NIMMessageForUI, isReplyMsg: boolean) => {
      switch (msg.messageType) {
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM:
          return renderCustomText(msg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
          return renderImage(msg, isReplyMsg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
          return renderFile(msg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION:
          return renderNotification(msg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
          return renderAudio(msg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL:
          return `[${t('callMsgText')}，${notSupportMessageText}]`
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
          return renderLocation(msg)
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_ROBOT:
          return `[${t('robotMsgText')}，${notSupportMessageText}]`
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS:
          return `[${t('tipMsgText')}，${notSupportMessageText}]`
        case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
          return renderVideo(msg)
        default:
          return `[${t('unknowMsgText')}，${notSupportMessageText}]`
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

export const getMsgContentTipByType = (
  msg: Pick<V2NIMMessage, 'messageType' | 'text'>,
  t
): string => {
  const { messageType, text } = msg
  switch (messageType) {
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
      return text || `[${t('textMsgText')}]`
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM:
      return text || `[${t('customMsgText')}]`
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
      return `[${t('unknowMsgText')}]`
  }
}
