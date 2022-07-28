import React from 'react'
import { Image } from 'antd'
import reactStringReplace from 'react-string-replace'
import CommonIcon from '../CommonIcon'
import { getFileType, parseFileSize, addUrlSearch } from '@xkit-yx/utils'
import { EMOJI_ICON_MAP_CONFIG, INPUT_EMOJI_SYMBOL_REG } from '../../constant'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { useTranslation } from '../../index'

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
  const notSuportMessageText = t('notSuportMessageText')

  const renderCustomText = (msg) => {
    const text = reactStringReplace(
      msg.body?.trim(),
      /(https?:\/\/\S+)/g,
      (match, i) => (
        <a key={match + i} href={match}>
          {match}
        </a>
      )
    )

    return reactStringReplace(text, INPUT_EMOJI_SYMBOL_REG, (match) => {
      return (
        <CommonIcon
          key={msg.idClient}
          className={`${_prefix}-emoji-icon`}
          type={EMOJI_ICON_MAP_CONFIG[match]}
        />
      )
    })
  }

  const renderImage = (msg) => {
    return (
      <Image
        rootClassName={`${_prefix}-image`}
        // width={msg?.attach?.w}
        // height={msg?.attach?.h}
        src={msg?.attach?.url}
      />
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
    return null
  }

  return (
    <>
      {(() => {
        switch (msg.type) {
          case 'text':
          case 'custom':
            return renderCustomText(msg)
          case 'image':
            return renderImage(msg)
          case 'file':
            return renderFile(msg)
          case 'notification':
            return `[${t('notiMsgText')}]，${notSuportMessageText}`
          case 'audio':
            return `[${t('audioMsgText')}]，${notSuportMessageText}`
          case 'g2':
            return `[${t('callMsgText')}]，${notSuportMessageText}`
          case 'geo':
            return `[${t('geoMsgText')}]，${notSuportMessageText}`
          case 'robot':
            return `[${t('robotMsgText')}]，${notSuportMessageText}`
          case 'tip':
            return `[${t('tipMsgText')}]，${notSuportMessageText}`
          case 'video':
            return `[${t('videoMsgText')}]，${notSuportMessageText}`
          default:
            return `[${t('unknowMsgText')}]，${notSuportMessageText}`
        }
      })()}
    </>
  )
}
