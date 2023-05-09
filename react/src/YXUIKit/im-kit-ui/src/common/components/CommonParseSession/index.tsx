import React, { useMemo, useRef, useState } from 'react'
import { Image, Popover } from 'antd'
import reactStringReplace from 'react-string-replace'
import CommonIcon from '../CommonIcon'
import { getFileType, parseFileSize, addUrlSearch } from '@xkit-yx/utils'
// import { EMOJI_ICON_MAP_CONFIG, INPUT_EMOJI_SYMBOL_REG } from '../../constant'
import { handleEmojiTranslate } from '../../../utils'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { useTranslation, useStateContext } from '../../index'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { observer } from 'mobx-react'
import { parseSessionId } from '../../../utils'

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
  msg: IMMessage
  replyMsg?: IMMessage
}

export const ParseSession: React.FC<IParseSessionProps> = observer(
  ({ prefix = 'common', msg, replyMsg }) => {
    const _prefix = `${prefix}-parse-session`
    const { store } = useStateContext()
    // const imagePreview = useRef<HTMLDivElement | null>(null)
    const { t } = useTranslation()
    const locationDomRef = useRef<HTMLDivElement | null>(null)
    const audioContainerRef = useRef<HTMLDivElement>(null)
    const notSupportMessageText = t('notSupportMessageText')
    // const { type, body, idClient, sessionId, ext } = msg
    const [audioIconType, setAudioIconType] = useState('icon-yuyin3')
    const { scene, to } = parseSessionId(msg.sessionId)

    const teamId = scene === 'team' ? to : ''

    const { EMOJI_ICON_MAP_CONFIG, INPUT_EMOJI_SYMBOL_REG } =
      handleEmojiTranslate(t)

    const renderCustomText = (msg) => {
      const { body, idClient, ext } = msg

      let text = reactStringReplace(body, /(https?:\/\/\S+)/gi, (match, i) => (
        <a key={idClient + match + i} href={match} target="_blank">
          {match}
        </a>
      ))
      text = reactStringReplace(text, INPUT_EMOJI_SYMBOL_REG, (match, i) => {
        return (
          <CommonIcon
            key={idClient + match + i}
            className={`${_prefix}-emoji-icon`}
            type={EMOJI_ICON_MAP_CONFIG[match]}
          />
        )
      })
      if (ext) {
        try {
          const extObj = JSON.parse(ext)
          const yxAitMsg = extObj.yxAitMsg
          if (yxAitMsg) {
            Object.keys(yxAitMsg).forEach((key) => {
              const item = yxAitMsg[key]
              text = reactStringReplace(text, item.text, (match, i) => {
                return (
                  <span
                    key={idClient + match + i}
                    className={`${_prefix}-mention`}
                  >
                    {match}
                  </span>
                )
              })
            })
          }
        } catch {}
      }
      return <div className={`${_prefix}-text-wrapper`}>{text}</div>
    }

    const renderImage = (msg) => {
      const { attach } = msg
      const url = `${attach?.url}?download=${msg.idClient}.${attach?.ext}`
      return (
        <div
          className={`${_prefix}-image-container`}
          onContextMenu={(e) => {
            e.stopPropagation()
          }}
        >
          <Image rootClassName={`${_prefix}-image`} src={url} />
        </div>
      )
    }

    const renderFile = (msg) => {
      return (
        <div className={`${_prefix}-file-box`}>
          <CommonIcon
            className={`${_prefix}-file-icon`}
            type={
              fileIconMap[getFileType(msg?.attach?.ext)] || 'icon-weizhiwenjian'
            }
          />
          <div className={`${_prefix}-file-info`}>
            <a
              download={msg?.attach?.name}
              href={addUrlSearch(
                msg?.attach?.url,
                `download=${msg?.attach?.name}`
              )}
              target="_blank"
            >
              {msg?.attach?.name}
            </a>
            <span>{parseFileSize(msg?.attach?.size)}</span>
          </div>
        </div>
      )
    }

    const renderNotification = (msg) => {
      switch (msg.attach?.type) {
        case 'updateTeam': {
          const team: Team = msg.attach?.team || {}
          const content: string[] = []
          if (team.avatar) {
            content.push(t('updateTeamAvatar'))
          }
          if (team.name) {
            content.push(`${t('updateTeamName')}“${team.name}”`)
          }
          if (team.intro) {
            content.push(t('updateTeamIntro'))
          }
          if (team.inviteMode) {
            content.push(
              `${t('updateTeamInviteMode')}“${
                team.inviteMode === 'all' ? t('teamAll') : t('onlyTeamOwner')
              }”`
            )
          }
          if (team.updateTeamMode) {
            content.push(
              `${t('updateTeamUpdateTeamMode')}“${
                team.updateTeamMode === 'all'
                  ? t('teamAll')
                  : t('onlyTeamOwner')
              }”`
            )
          }
          if (team.muteType) {
            content.push(
              `${t('updateTeamMute')}${
                team.muteType === 'none' ? t('closeText') : t('openText')
              }`
            )
          }
          return (
            <div className={`${_prefix}-noti`}>
              {store.uiStore.getAppellation({
                account: msg.from,
                teamId,
              })}{' '}
              {content.join('、')}
            </div>
          )
        }
        // 有人主动加入群聊
        case 'passTeamApply':
        // 邀请加入群聊对方同意
        case 'acceptTeamInvite': {
          return (
            <div className={`${_prefix}-noti`}>
              {store.uiStore.getAppellation({ account: msg.from, teamId })}{' '}
              {t('joinTeamText')}
            </div>
          )
        }
        // 邀请加入群聊无需验证
        case 'addTeamMembers': {
          const accounts: string[] = msg.attach?.accounts || []
          const nicks = accounts
            .map((item) =>
              store.uiStore.getAppellation({ account: item, teamId })
            )
            .filter((item) => !!item)
            .join('、')
          return (
            <div className={`${_prefix}-noti`}>
              {nicks} {t('joinTeamText')}
            </div>
          )
        }
        // 踢出群聊
        case 'removeTeamMembers': {
          const accounts: string[] = msg.attach?.accounts || []
          const nicks = accounts
            .map((item) =>
              store.uiStore.getAppellation({ account: item, teamId })
            )
            .filter((item) => !!item)
            .join('、')
          return (
            <div className={`${_prefix}-noti`}>
              {nicks} {t('beRemoveTeamText')}
            </div>
          )
        }
        // 主动退出群聊
        case 'leaveTeam': {
          return (
            <div className={`${_prefix}-noti`}>
              {store.uiStore.getAppellation({ account: msg.from, teamId })}{' '}
              {t('leaveTeamText')}
            </div>
          )
        }
        default:
          return null
      }
    }

    const renderAudio = (msg) => {
      const { flow, attach } = msg
      const duration = Math.floor(attach?.dur / 1000) || 0
      let animationFlag = false
      let audioIcons
      const animationFn = () => {
        setAudioIconType(audioIcons.shift())
        audioIcons.length === 0 &&
          animationFlag &&
          (audioIcons = ['icon-yuyin1', 'icon-yuyin2', 'icon-yuyin3'])
        if (audioIcons.length > 0) {
          setTimeout(animationFn, 300)
        }
      }

      const containerWidth = 80 + 15 * (duration - 1)

      return (
        <div
          className={`${_prefix}-audio-container`}
          style={{ width: containerWidth }}
          ref={audioContainerRef}
        >
          <div
            className={
              flow === 'in' ? `${_prefix}-audio-in` : `${_prefix}-audio-out`
            }
            onClick={() => {
              const oldAudio = document.getElementById(
                'yx-audio-message'
              ) as HTMLAudioElement
              const msgId = oldAudio?.getAttribute('msgId')
              oldAudio?.pause()
              if (msgId === msg.idClient) {
                animationFlag = false
                return
              }
              const audio = new Audio(attach?.url)
              // 播放音频，并开始动画
              audio.id = 'yx-audio-message'
              audio.setAttribute('msgId', msg.idClient)
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
              audioIcons = ['icon-yuyin1', 'icon-yuyin2', 'icon-yuyin3']
              animationFlag = true
              animationFn()
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

    const renderVideo = (msg) => {
      const { attach } = msg
      const url = `${attach?.url}?download=${msg.idClient}.${attach?.ext}`
      return (
        <video
          src={url}
          id={`msg-video-${msg.idClient}`}
          controls
          onPlay={() => {
            // 播放视频，暂停其他视频
            const videoElements = document.getElementsByTagName('video')
            for (let i = 0; i < videoElements.length; i++) {
              if (videoElements[i].id !== `msg-video-${msg.idClient}`) {
                videoElements[i].pause()
              }
            }
          }}
          onError={() => {
            // 处理异常 例如：视频格式不支持播放等
          }}
          height={300}
        />
      )
    }

    const renderLocation = (msg) => {
      const { attach, body } = msg
      const amapUrl = `https://uri.amap.com/marker?position=${attach?.lng},${attach?.lat}&name=${body}`
      const txmapUrl = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${attach?.lat},${attach?.lng};title:${body};addr:${attach?.title}&referer=myapp`
      const bdmapUrl = `http://api.map.baidu.com/marker?location=${attach?.lat},${attach?.lng}&title=${body}&content=${attach?.title}&output=html&coord_type=gcj02&src=myapp`
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
            <div className={`${_prefix}-location-title`}>{body}</div>
            <div className={`${_prefix}-location-subTitle`}>
              {attach?.title}
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
          account: replyMsg.from,
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
                {renderMsgContent(replyMsg)}
              </>
            )}
          </div>
        )
      }
      return null
    }

    const renderMsgContent = (msg) => {
      switch (msg.type) {
        case 'text':
        case 'custom':
          return renderCustomText(msg)
        case 'image':
          return renderImage(msg)
        case 'file':
          return renderFile(msg)
        case 'notification':
          return renderNotification(msg)
        case 'audio':
          return renderAudio(msg)
        case 'g2':
          return `[${t('callMsgText')}，${notSupportMessageText}]`
        case 'geo':
          return renderLocation(msg)
        case 'robot':
          return `[${t('robotMsgText')}，${notSupportMessageText}]`
        case 'tip':
          return `[${t('tipMsgText')}，${notSupportMessageText}]`
        case 'video':
          return renderVideo(msg)
        default:
          return `[${t('unknowMsgText')}，${notSupportMessageText}]`
      }
    }

    return (
      <>
        {renderReplyMsg()}
        {renderMsgContent(msg)}
      </>
    )
  }
)

export const getMsgContentTipByType = (
  msg: Pick<IMMessage, 'type' | 'body'>,
  t
): string => {
  const { type, body } = msg
  switch (type) {
    case 'text':
      return body || `[${t('textMsgText')}]`
    case 'custom':
      return body || `[${t('customMsgText')}]`
    case 'audio':
      return `[${t('audioMsgText')}]`
    case 'file':
      return `[${t('fileMsgText')}]`
    case 'g2':
      return `[${t('callMsgText')}]`
    case 'geo':
      return `[${t('geoMsgText')}]`
    case 'image':
      return `[${t('imgMsgText')}]`
    case 'notification':
      return `[${t('notiMsgText')}]`
    case 'robot':
      return `[${t('robotMsgText')}]`
    case 'tip':
      return `[${t('tipMsgText')}]`
    case 'video':
      return `[${t('videoMsgText')}]`
    default:
      return `[${t('unknowMsgText')}]`
  }
}
