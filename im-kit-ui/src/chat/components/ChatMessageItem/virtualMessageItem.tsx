import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

export interface VirtualMessageItemProps {
  key: string
  msg: V2NIMMessage
  msgItem: JSX.Element
  scrollTop: number
}

// eslint-disable-next-line react/display-name
const VirtualMessageItem: React.FC<VirtualMessageItemProps> = memo(
  ({
    msg,
    msgItem,
    scrollTop,
  }: {
    msg: V2NIMMessageForUI
    msgItem: JSX.Element
    scrollTop: number
  }) => {
    const viewportBuffer = 1800
    const msgRef = useRef<HTMLDivElement>(null)
    const [msgHeight, setMsgHeight] = useState<number>(0)

    const isInViewport = useMemo(() => {
      if (msgHeight === 0) return true
      const element = msgRef.current

      if (!element) return false

      // 计算消息的顶部和底部位置
      const messageTop = element.offsetTop
      const messageBottom = messageTop + element.offsetHeight // 或者使用 msgHeight

      // 计算视口范围（包含缓冲区）
      const viewportTop = scrollTop - viewportBuffer
      const viewportBottom = scrollTop + viewportBuffer

      // 判断消息的任何部分是否与视口范围相交
      // 相交条件：消息底部 > 视口顶部 && 消息顶部 < 视口底部
      return messageBottom > viewportTop && messageTop < viewportBottom
    }, [msgHeight, scrollTop])

    useEffect(() => {
      const element = msgRef.current

      if (!element) return

      // 使用 document.getElementById 直接获取元素并设置高度
      const updateHeight = () => {
        const messageElement = msgRef.current

        if (
          msg.aiConfig?.aiStatus ===
          V2NIMConst.V2NIMMessageAIStatus.V2NIM_MESSAGE_AI_STATUS_RESPONSE
        ) {
          if (!messageElement) return
        } else if (messageElement && messageElement.offsetHeight > 0) {
          setMsgHeight(messageElement.offsetHeight)
        }
      }

      // 立即执行一次高度更新
      updateHeight()
    }, [msg.messageClientId, msg.text, msg.textOfVoice, msg.aiConfig?.aiStatus])

    // 监听textOfVoice变化，强制重新计算高度
    useEffect(() => {
      if (msg.textOfVoice) {
        // 延迟一段时间后强制更新，确保语音转文字内容已经渲染
        const timer = setTimeout(() => {
          // 获取目标父元素
          const parentDiv = document.getElementById(msg.messageClientId)
          // 获取子元素（单个元素用 querySelector，多个用 querySelectorAll）
          const targetElement = parentDiv?.querySelector(
            '.chat-message-list-item-wrap'
          )
          // @ts-ignore
          const elementHeight = targetElement?.offsetHeight

          if (parentDiv && targetElement && elementHeight) {
            setMsgHeight(elementHeight)
          } else {
            console.warn('未找到类名为 chat-message-list-item-wrap 的子元素')
          }

          clearTimeout(timer)
        }, 100)
      }
    }, [msg.textOfVoice, msg.messageClientId])

    return (
      <div
        id={msg.messageClientId}
        key={msg.messageClientId}
        ref={msgRef}
        style={{
          height: msgHeight === 0 ? 'auto' : msgHeight,
          // 添加最小高度，防止高度为0时的布局问题
          minHeight: msgHeight === 0 ? 'auto' : msgHeight,
        }}
        data-height={msgHeight}
      >
        {isInViewport ? msgItem : null}
      </div>
    )
  }
)

export default VirtualMessageItem
