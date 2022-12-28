import React, { useRef } from 'react'
import { Image } from 'antd'
import reactStringReplace from 'react-string-replace'
import CommonIcon from '../CommonIcon'
import { getFileType, parseFileSize, addUrlSearch } from '@xkit-yx/utils'
import { EMOJI_ICON_MAP_CONFIG, INPUT_EMOJI_SYMBOL_REG } from '../../constant'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { useTranslation } from '../../index'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'

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
}

export const ParseSession: React.FC<IParseSessionProps> = ({
  prefix = 'common',
  msg,
}) => {
  const _prefix = `${prefix}-parse-session`
  const { t } = useTranslation()
  const imagePreview = useRef<HTMLDivElement | null>(null)
  const notSupportMessageText = t('notSupportMessageText')

  const { type, body, idClient } = msg

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

    return reactStringReplace(text, INPUT_EMOJI_SYMBOL_REG, (match, i) => {
      return (
        <CommonIcon
          key={idClient + match + i}
          className={`${_prefix}-emoji-icon`}
          type={EMOJI_ICON_MAP_CONFIG[match]}
        />
      )
    })
  }

  const renderImage = () => {
    return (
      <div
        onContextMenu={(e) => {
          e.stopPropagation()
        }}
        ref={imagePreview}
      >
        <Image rootClassName={`${_prefix}-image`} src={msg?.attach?.url} />
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
              team.updateTeamMode === 'all' ? t('teamAll') : t('onlyTeamOwner')
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
            {msg.fromNick || msg.from} {content.join('、')}
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
            {msg.fromNick || msg.from} {t('joinTeamText')}
          </div>
        )
      }
      // 踢出群聊
      case 'removeTeamMembers': {
        const accounts: string[] = msg.attach?.accounts || []
        const users: UserNameCard[] = accounts.map((item) => {
          return (msg.attach?.users || []).find((j) => item === j.account) || {}
        })
        const nicks = users
          .map((item) => item.nick || item.account || '')
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
            {user.nick || user.account || ''} {t('leaveTeamText')}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <>
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
            return `[${t('audioMsgText')}，${notSupportMessageText}]`
          case 'g2':
            return `[${t('callMsgText')}，${notSupportMessageText}]`
          case 'geo':
            return `[${t('geoMsgText')}，${notSupportMessageText}]`
          case 'robot':
            return `[${t('robotMsgText')}，${notSupportMessageText}]`
          case 'tip':
            return `[${t('tipMsgText')}，${notSupportMessageText}]`
          case 'video':
            return `[${t('videoMsgText')}，${notSupportMessageText}]`
          default:
            return `[${t('unknowMsgText')}，${notSupportMessageText}]`
        }
      })()}
    </>
  )
}
