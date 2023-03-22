import React, { useState, useRef, Fragment } from 'react'
import { Input, Upload, Popover, message, Button, Spin } from 'antd'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import {
  CommonIcon,
  Constant,
  getMsgContentTipByType,
  Utils,
  useTranslation,
  useStateContext,
} from '../../../common'
import { Action } from '../../Container'
import { MAX_UPLOAD_FILE_SIZE } from '../../constant'
import { LoadingOutlined, CloseOutlined } from '@ant-design/icons'
import { TMsgScene } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { observer } from 'mobx-react'

const { TextArea } = Input
export interface ChatMessageInputProps {
  prefix?: string
  placeholder?: string
  replyMsg?: IMMessage
  scene: TMsgScene
  to: string
  actions?: Action[]
  mute?: boolean
  inputValue?: string
  uploadImageLoading?: boolean
  uploadFileLoading?: boolean
  setInputValue: (value: string) => void
  onSendText: (value: string) => void
  onSendFile: (file: File) => void
  onSendImg: (file: File) => void
  onRemoveReplyMsg?: () => void
}

const mergeActions = (
  defaultActions: Action[] = [],
  propsActions: Action[] = []
) => {
  return propsActions.map((i) => {
    const defaultAction = defaultActions.find((j) => i.action === j.action)
    if (defaultAction) {
      return {
        ...defaultAction,
        ...i,
      }
    } else {
      return i
    }
  })
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = observer((props) => {
  const {
    prefix = 'chat',
    placeholder = '',
    actions,
    scene,
    to,
    mute = false,
    inputValue = '',
    uploadImageLoading = false,
    uploadFileLoading = false,
    replyMsg,
    setInputValue,
    onSendText,
    onSendFile,
    onSendImg,
    onRemoveReplyMsg,
  } = props

  const { t } = useTranslation()
  const { store } = useStateContext()
  const _prefix = `${prefix}-message-input`
  const inputRef = useRef<any>(null)
  const [visible, setVisible] = useState<boolean>(false)
  const antIcon = <LoadingOutlined className={`${_prefix}-loading-spin`} spin />
  const { EMOJI_ICON_MAP_CONFIG } = Utils.handleEmojiTranslate(t)
  const defaultActions: Action[] = [
    {
      action: 'emoji',
      visible: true,
      render: () => {
        return (
          <Button type="text" disabled={mute}>
            <Popover
              // placement="right"
              // getPopupContainer={() =>
              //   document.getElementById('chat-kit-app') || false
              // }
              trigger="click"
              visible={visible}
              overlayClassName={`${_prefix}-emoji-box`}
              content={emojiContent}
              onVisibleChange={handleVisibleChange}
            >
              <CommonIcon
                className={`${_prefix}-icon-emoji`}
                type="icon-biaoqing"
              />
              {/* <Icon
                    className={`${_prefix}-icon-btn`}
                    type="icon-biaoqing"
                    width={18}
                    height={18}
                    onClick={() => setVisible(true)}
                  /> */}
            </Popover>
          </Button>
        )
      },
    },
    {
      action: 'sendImg',
      visible: true,
      render: () => {
        return (
          <Button size="small" disabled={mute}>
            {uploadImageLoading ? (
              <Spin indicator={antIcon} />
            ) : (
              <Upload
                beforeUpload={onBeforeUploadHandler}
                showUploadList={false}
                accept=".jpg,.png,.jpeg,.gif"
                action={onUploadImgHandler}
                className={`${_prefix}-icon-upload`}
              >
                <CommonIcon
                  className={`${_prefix}-icon-image`}
                  type="icon-tupian"
                />
              </Upload>
            )}
          </Button>
        )
      },
    },
    {
      action: 'sendFile',
      visible: true,
      render: () => {
        return (
          <Button size="small" disabled={mute}>
            {uploadFileLoading ? (
              <Spin indicator={antIcon} />
            ) : (
              <Upload
                beforeUpload={onBeforeUploadHandler}
                showUploadList={false}
                disabled={mute}
                action={onUploadFileHandler}
                className={`${_prefix}-icon-upload`}
              >
                <CommonIcon
                  className={`${_prefix}-icon-file`}
                  type="icon-wenjian"
                />
              </Upload>
            )}
          </Button>
        )
      },
    },
  ]

  const finalActions = actions
    ? mergeActions(defaultActions, actions)
    : defaultActions

  const onInputChangeHandler = (e: any) => {
    setInputValue(e.target.value)
  }

  const onPressEnterHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const trimValue = inputValue.trim()
    if (!e.shiftKey) {
      e.preventDefault()
      if (!trimValue) {
        message.warning(t('sendEmptyText'))
        return
      }
      onSendText(trimValue)
      setInputValue('')
    }
  }

  const onBeforeUploadHandler = (
    file: File
  ): boolean | Promise<void | Blob | File> => {
    const isLimit = file.size / 1024 / 1000 > MAX_UPLOAD_FILE_SIZE

    if (isLimit) {
      message.error(
        `${t('uploadLimitText')}${MAX_UPLOAD_FILE_SIZE}${t('uploadLimitUnit')}`
      )
    }

    return !isLimit
  }

  const onUploadImgHandler = (file: any): any => {
    onSendImg(file)
  }
  const onUploadFileHandler = (file: any): any => {
    onSendFile(file)
  }

  const onEmojiClickHandler = (tag: string) => {
    const input = inputRef.current.resizableTextArea.textArea
    input?.focus()
    input?.setRangeText(tag, input.selectionStart, input.selectionEnd, 'end')
    setInputValue(input.value)
    setVisible(false)
  }

  const handleVisibleChange = (newVisible: boolean) => {
    setVisible(newVisible)
  }

  const emojiContent = (
    <>
      {Object.keys(EMOJI_ICON_MAP_CONFIG).map((tag: string, index) => (
        <span
          onClick={() => {
            onEmojiClickHandler(tag)
          }}
          className={`${_prefix}-emoji-item`}
          title={tag}
          key={tag}
        >
          <CommonIcon
            className={`${_prefix}-emoji-item-icon`}
            type={EMOJI_ICON_MAP_CONFIG[tag]}
          />
        </span>
      ))}
    </>
  )

  const replyMsgContent = () => {
    let content = `${t('replyText')} ${store.uiStore.getAppellation({
      account: replyMsg?.from || '',
      teamId: scene === 'team' ? to : '',
    })}：`
    content += replyMsg ? getMsgContentTipByType(replyMsg, t) : ''
    return <div className={`${_prefix}-reply-content`}>{content}</div>
  }

  // const isMute = useMemo(() => {
  //   return (teamInfo as ITeamInfo).mute && !isGroupOwner && !isGroupManager
  // }, [teamInfo, isGroupOwner, isGroupManager])

  return (
    <div className={`${prefix}-message-input`}>
      <div className={`${_prefix}-wrap`}>
        {!!replyMsg && (
          <div className={`${_prefix}-reply-wrap`}>
            <div className={`${_prefix}-reply-container`}>
              <CloseOutlined onClick={() => onRemoveReplyMsg?.()} />
              {replyMsgContent()}
            </div>
          </div>
        )}
        <div className={`${_prefix}-content`}>
          <TextArea
            ref={inputRef}
            bordered={false}
            className={`${_prefix}-textarea`}
            placeholder={placeholder}
            value={inputValue}
            disabled={mute}
            onChange={onInputChangeHandler}
            onPressEnter={onPressEnterHandler}
            autoSize={{ maxRows: 2 }}
          />
          <div className={`${_prefix}-icon-box`}>
            {finalActions.map((item) =>
              item.render && item.visible ? (
                <Fragment key={item.action}>
                  {item.render({
                    ...props,
                    prefix: _prefix,
                  })}
                </Fragment>
              ) : null
            )}
          </div>
          {/* <div
        contentEditable="true"
        ref={divRef}
        className={`${_prefix}-textarea`}
        onInput={() => {
          setValue(divRef?.current.innerHTML)
        }}
        onKeyUp={onPressEnterHandler}
      ></div> */}
        </div>
      </div>
    </div>
  )
})

export default ChatMessageInput
