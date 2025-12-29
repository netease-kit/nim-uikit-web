import React from 'react'
import { CommonIcon, useTranslation } from '../../../common'
import { message, Modal } from 'antd'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'

export interface MultiMessageOperationProps {
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  prefix?: string
  disabled?: boolean
  selectedMsgIds: string[]
  msgs: V2NIMMessageForUI[]
  onRemoveSelectedMsgs?: (msgIds: string[]) => void
}

const MultiMessageOperation: React.FC<MultiMessageOperationProps> = ({
  onConfirm,
  onCancel,
  confirmText = '合并转发',
  cancelText = '取消',
  prefix = 'chat',
  disabled = false,
  selectedMsgIds,
  msgs,
  onRemoveSelectedMsgs,
}) => {
  const { t } = useTranslation()

  const handleConfirmClick = () => {
    const selectedMsgs = msgs.filter((m) =>
      selectedMsgIds.includes(m.messageClientId)
    )

    if (selectedMsgs.length > 100) {
      message.error(t('forwardMsgMax100Text'))
      return
    }

    const unforwardableMsgs = selectedMsgs.filter((m) => {
      const failed =
        m.sendingState ===
        V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED

      const isCustom =
        m.messageType === V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM

      let tooDeep = false

      if (isCustom) {
        let payload: any = undefined
        const raw = (m as any).attachment?.raw
        const content = (m as any).content
        const text = (m as any).text

        if (typeof raw === 'string') {
          try {
            payload = JSON.parse(raw)
          } catch {
            payload = undefined
          }
        } else if (raw && typeof raw === 'object') {
          payload = raw
        } else if (typeof content === 'string') {
          try {
            payload = JSON.parse(content)
          } catch {
            payload = undefined
          }
        } else if (content && typeof content === 'object') {
          payload = content
        } else if (typeof text === 'string') {
          try {
            payload = JSON.parse(text)
          } catch {
            payload = undefined
          }
        }

        if (payload && payload.type === 101) {
          const d = Number(payload?.data?.depth ?? payload?.depth ?? 0)

          tooDeep = !Number.isNaN(d) && d >= 3
        }
      }

      return failed || tooDeep
    })

    if (unforwardableMsgs.length > 0) {
      Modal.confirm({
        title: t('exceptionDescription'),
        content: t('forwardHasUnforwardableConfirmText'),
        onOk: () => {
          if (onRemoveSelectedMsgs) {
            onRemoveSelectedMsgs(
              unforwardableMsgs.map((m) => m.messageClientId)
            )
            // 如果去除后还有消息，则继续转发
            if (selectedMsgs.length > unforwardableMsgs.length) {
              onConfirm()
            }
          }
        },
        centered: true,
      })
      return
    }

    onConfirm()
  }

  return (
    <div className={`${prefix}-multi-forward`}>
      <div className={`${prefix}-multi-forward-btn`}>
        <div
          className={`${prefix}-multi-forward-item ${
            disabled ? `${prefix}-multi-forward-item-disabled` : ''
          }`}
          onClick={disabled ? undefined : handleConfirmClick}
        >
          <div
            className={`${prefix}-multi-forward-icon ${prefix}-multi-forward-icon-confirm`}
          >
            <CommonIcon type="icon-zhuanfa" size={24} />
          </div>
          <div className={`${prefix}-multi-forward-label`}>{confirmText}</div>
        </div>
        <div className={`${prefix}-multi-forward-item`} onClick={onCancel}>
          <div
            className={`${prefix}-multi-forward-icon ${prefix}-multi-forward-icon-cancel`}
          >
            <CommonIcon type="icon-guanbi" size={24} />
          </div>
          <div className={`${prefix}-multi-forward-label`}>{cancelText}</div>
        </div>
      </div>
    </div>
  )
}

export default MultiMessageOperation
