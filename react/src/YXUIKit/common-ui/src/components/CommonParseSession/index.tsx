import React, { useMemo, useRef, useState } from 'react'
import { Image, Popover } from 'antd'
import reactStringReplace from 'react-string-replace'
import CommonIcon from '../CommonIcon'
import { getFileType, parseFileSize, addUrlSearch } from '@xkit-yx/utils'
// import { EMOJI_ICON_MAP_CONFIG, INPUT_EMOJI_SYMBOL_REG } from '../../constant'
import { handleEmojiTranslate } from '../../utils'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { useTranslation, useStateContext } from '../../index'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { observer } from 'mobx-react'
import { parseSessionId } from '../../utils'
// 对话框中要展示的文件icon标识
const fileIconMap = {
  img: 'icon-tupian2',
  pdf: 'iconPDF',
  word: 'icon-Word',
  excel: 'icon-Excel',
  ppt: 'icon-PPT',
  audio: 'icon-yinle',
  zip: 'icon-RAR1',
  video: 'icon-shipin',
}

export interface IParseSessionProps {
  prefix?: string
  msg: IMMessage
  replyMsg?: Pick<
    IMMessage,
    'type' | 'body' | 'attach' | 'idClient' | 'fromNick' | 'from'
  >
}

export const ParseSession: React.FC<IParseSessionProps> = observer(
  ({ prefix = 'common', msg, replyMsg }) => {
    const _prefix = `${prefix}-parse-session`
    const { store } = useStateContext()
    const { t } = useTranslation()
    // const imagePreview = useRef<HTMLDivElement | null>(null)
    const locationDomRef = useRef<HTMLDivElement | null>(null)
    const notSupportMessageText = t('notSupportMessageText')
    const { type, body, idClient, sessionId } = msg
    const [audioIconType, setAudioIconType] = useState('icon-yuyin3')
    const { scene, to } = parseSessionId(sessionId)

    const teamId = scene === 'team' ? to : ''
    const { EMOJI_ICON_MAP_CONFIG, INPUT_EMOJI_SYMBOL_REG } =
      handleEmojiTranslate(t)
    const renderCustomText = () => {
      const text = reactStringReplace(
        body?.trim(),
        /(https?:\/\/\S+)/gi,
        (match, i) => (
          <a key={idClient + match + i} href={match} target="_blank">
            {match}
          </a>
        )
      )

      return (
        <div className={`${_prefix}-text-wrapper`}>
          {reactStringReplace(text, INPUT_EMOJI_SYMBOL_REG, (match, i) => {
            return (
              <CommonIcon
                key={idClient + match + i}
                className={`${_prefix}-emoji-icon`}
                type={EMOJI_ICON_MAP_CONFIG[match]}
              />
            )
          })}
        </div>
      )
    }

    const renderImage = () => {
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

    const renderFile = () => {
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

    const renderNotification = () => {
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
        // 主动加入群聊
        case 'passTeamApply':
        // 邀请加入群聊
        // case 'addTeamMembers' : // 忘了为什么写这个，但是实测是下面这个，先注释掉留着
        case 'acceptTeamInvite': {
          return (
            <div className={`${_prefix}-noti`}>
              {store.uiStore.getAppellation({ account: msg.from, teamId })}{' '}
              {t('joinTeamText')}
            </div>
          )
        }
        // 踢出群聊
        case 'removeTeamMembers': {
          const accounts: string[] = msg.attach?.accounts || []
          const users: UserNameCard[] = accounts.map((item) => {
            return (
              (msg.attach?.users || []).find((j) => item === j.account) || {}
            )
          })
          const nicks = users
            .map((item) =>
              store.uiStore.getAppellation({ account: item.account, teamId })
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
          const user: UserNameCard = (msg.attach?.users || [])[0] || {}
          return (
            <div className={`${_prefix}-noti`}>
              {store.uiStore.getAppellation({ account: user.account, teamId })}{' '}
              {t('leaveTeamText')}
            </div>
          )
        }
        default:
          return null
      }
    }

    const renderAudio = () => {
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
        >
          <div
            className={
              flow === 'in' ? `${_prefix}-audio-in` : `${_prefix}-audio-out`
            }
            onClick={() => {
              const oldAudio = document.getElementById(
                'yx-audio-message'
              ) as HTMLAudioElement
              oldAudio?.pause()
              const audio = new Audio(attach?.url)
              // 播放音频，并开始动画
              audio.id = 'yx-audio-message'
              audio.play()
              document.body.appendChild(audio)
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

    const renderVideo = () => {
      const { attach } = msg
      const url = `${attach?.url}?download=${msg.idClient}.${attach?.ext}`
      return (
        <video
          src={url}
          controls
          onError={() => {
            // 处理异常 例如：视频格式不支持播放等
          }}
          height={300}
        />
      )
    }

    const renderLocation = () => {
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
          placement="right"
          getPopupContainer={() => locationDomRef.current || document.body}
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
        if (
          replyMsg.type === 'custom' &&
          ['reCallMsg', 'beReCallMsg'].includes(replyMsg.attach?.type)
        ) {
          content = t('recallReplyMessageText')
        } else {
          content =
            `${store.uiStore.getAppellation({
              account: replyMsg.from,
              teamId,
            })}：` + getMsgContentTipByType(replyMsg, t)
        }

        return (
          <div
            className={`${_prefix}-reply-wrapper`}
            onClick={() => {
              // 滚动到回复的消息
              document.getElementById(replyMsg.idClient)?.scrollIntoView()
            }}
          >
            {content}
          </div>
        )
      }
      return null
    }

    return (
      <>
        {renderReplyMsg()}
        {(() => {
          switch (type) {
            case 'text':
            case 'custom':
              return renderCustomText()
            case 'image':
              return renderImage()
            case 'file':
              return renderFile()
            case 'notification':
              return renderNotification()
            case 'audio':
              return renderAudio()
            case 'g2':
              return `[${t('callMsgText')}，${notSupportMessageText}]`
            case 'geo':
              return renderLocation()
            case 'robot':
              return `[${t('robotMsgText')}，${notSupportMessageText}]`
            case 'tip':
              return `[${t('tipMsgText')}，${notSupportMessageText}]`
            case 'video':
              return renderVideo()
            default:
              return `[${t('unknowMsgText')}，${notSupportMessageText}]`
          }
        })()}
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
