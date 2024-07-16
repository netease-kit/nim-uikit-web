import React, { useEffect, useState } from 'react'
import {
  V2NIMMessage,
  V2NIMMessageDeletedNotification,
  V2NIMMessageRevokeNotification,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMMessageService'
import {
  CommonIcon,
  ParseSession,
  useStateContext,
  useTranslation,
} from '../../../common'
import { V2NIMConst } from 'nim-web-sdk-ng'
import { logger } from '../../../utils'
import { V2NIMError } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/types'
import { Button } from 'antd'
import { observer } from 'mobx-react'
import { YxTopMessage } from '@xkit-yx/im-store-v2/dist/types/types'

export interface ChatTopMessageProps {
  topMessage: YxTopMessage
  allowTop: boolean
  onClose: (msg: V2NIMMessage, isTop: boolean) => void

  prefix?: string
  commonPrefix?: string
}

const ChatTopMessage: React.FC<ChatTopMessageProps> = observer(
  ({
    topMessage,
    allowTop,
    onClose,

    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { store, nim } = useStateContext()
    const { t } = useTranslation()
    const [msg, setMsg] = useState<V2NIMMessage>()
    const [isShow, setIsShow] = useState(true)

    const _prefix = `${prefix}-top-msg`

    useEffect(() => {
      if (topMessage.idClient) {
        setIsShow(topMessage.operation === 0)
      }
    }, [topMessage.idClient, topMessage.operation])

    useEffect(() => {
      const handleMessageDelete = (data: V2NIMMessageDeletedNotification[]) => {
        // 如果置顶的消息被删除了，需要不展示置顶消息
        if (
          data.some(
            (item) => item.messageRefer.messageClientId === msg?.messageClientId
          )
        ) {
          setIsShow(false)
        }
      }

      const handleMessageRevoke = (data: V2NIMMessageRevokeNotification[]) => {
        // 如果置顶的消息被撤回了，且无权限更改群聊扩展字段时，需要本地不展示置顶消息
        if (
          data.some(
            (item) => item.messageRefer.messageClientId === msg?.messageClientId
          )
        ) {
          setIsShow(false)
        }
      }

      nim.V2NIMMessageService.on(
        'onMessageDeletedNotifications',
        handleMessageDelete
      )
      nim.V2NIMMessageService.on(
        'onMessageRevokeNotifications',
        handleMessageRevoke
      )

      return () => {
        nim.V2NIMMessageService.off(
          'onMessageDeletedNotifications',
          handleMessageDelete
        )
        nim.V2NIMMessageService.off(
          'onMessageRevokeNotifications',
          handleMessageRevoke
        )
      }
    }, [nim.V2NIMMessageService, msg?.messageClientId])

    useEffect(() => {
      const params = {
        senderId: topMessage.from,
        receiverId: topMessage.receiverId,
        messageClientId: topMessage.idClient,
        messageServerId: topMessage.idServer,
        createTime: topMessage.time,
        conversationType: topMessage.scene,
        conversationId: topMessage.to,
      }

      logger.log('获取置顶消息', params)

      nim.V2NIMMessageService.getMessageListByRefers([params])
        .then((res) => {
          const _msg = res[0]

          if (_msg) {
            // @ts-ignore
            delete _msg.uploadProgress

            setMsg(store.msgStore.handleReceiveAIMsg(_msg))
          }
        })
        .catch((err) => {
          logger.error(
            '获取置顶消息失败：',
            params,
            (err as V2NIMError).toString()
          )
          setMsg(undefined)
        })
    }, [
      nim.V2NIMConversationIdUtil,
      nim.V2NIMMessageService,
      topMessage.from,
      topMessage.receiverId,
      topMessage.to,
      topMessage.idClient,
      topMessage.idServer,
      topMessage.scene,
      topMessage.time,
      store.msgStore,
    ])

    const handleClose = () => {
      if (msg) {
        onClose(msg, false)
      }
    }

    return msg && isShow ? (
      <div className={`${_prefix}-wrap`}>
        <div className={`${_prefix}-content`}>
          <CommonIcon
            style={{ fontSize: 18, marginRight: 8 }}
            type="icon-a-zu278"
          />
          <span style={{ textWrap: 'nowrap' }}>
            {store.uiStore.getAppellation({
              account: msg.senderId,
              teamId: msg.receiverId,
            })}
            ：
          </span>
          {msg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION ? (
            <span style={{ textWrap: 'nowrap' }}>
              [{t('geoMsgShortText')}]&nbsp;
            </span>
          ) : null}
          <ParseSession
            prefix={commonPrefix}
            msg={msg}
            needTextTooltop={true}
            key={msg.messageClientId}
          />
        </div>
        {allowTop && (
          <Button onClick={handleClose} type="text">
            <CommonIcon style={{ fontSize: 10 }} type="icon-guanbi" />
          </Button>
        )}
      </div>
    ) : null
  }
)

export default ChatTopMessage
