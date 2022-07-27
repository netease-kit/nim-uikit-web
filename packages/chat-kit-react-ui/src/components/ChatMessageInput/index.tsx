import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Input, Upload, Popover, message, Button } from 'antd'
import { CommonIcon, Constant, useTranslation } from '@xkit-yx/common-ui'
import { MAX_UPLOAD_FILE_SIZE } from '../../constant'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import { ISendProps, ITeamInfo } from '../../types'
import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'

const { TextArea } = Input
export interface MessageProps {
  prefix?: string
  placeholder?: string
  selectedSession: NimKitCoreTypes.ISession
  teamInfo: ITeamInfo
  initOptions: NIMInitializeOptions
  onChange?: (val: string) => void
  onSend: (props: ISendProps) => void
  inputValue: string
  isGroupOwner: boolean
  isGroupManager: boolean
  uploadImageLoading: boolean
  uploadFileLoading: boolean
}

const ChatMessageInput: React.FC<MessageProps> = ({
  prefix = 'chat',
  placeholder = '',
  selectedSession,
  teamInfo,
  initOptions,
  inputValue,
  isGroupOwner,
  isGroupManager,
  uploadImageLoading,
  uploadFileLoading,
  onSend,
}) => {
  const { t } = useTranslation()
  const _prefix = `${prefix}-message-input`
  const inputRef = useRef<any>(null)
  const [value, setValue] = useState<string>('')
  const [visible, setVisible] = useState<boolean>(false)
  const { to, scene } = selectedSession
  const { account: from } = initOptions
  const antIcon = <LoadingOutlined className={`${_prefix}-loading-spin`} spin />

  useEffect(() => {
    setValue(inputValue)
  }, [inputValue])

  const onPressEnterHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const trimValue = value.trim()
    if (!e.shiftKey && !trimValue) {
      e.preventDefault()
      return message.warning(t('sendEmptyText'))
    }
    // if (e.keyCode === 13) {
    if (!e.shiftKey) {
      e.preventDefault()
      // divRef?.current.innerHTML = null
      onSend({
        body: trimValue,
        type: 'text',
        from,
        to,
        scene,
      })
      setValue('')
    }
  }

  const onBeforeUploadHandler = (
    file
  ): boolean | Promise<void | Blob | File> => {
    const isLimit = file.size / 1024 / 1000 > MAX_UPLOAD_FILE_SIZE

    if (isLimit) {
      message.error(
        `${t('uploadLimitText')}${MAX_UPLOAD_FILE_SIZE}${t('uploadLimitUnit')}`
      )
    }

    return !isLimit
  }

  const onUploadImgHandler = (file): any => {
    onSend({
      file,
      type: 'image',
      from,
      to,
      scene,
    })
  }
  const onUploadFileHandler = (file): any => {
    onSend({
      file,
      type: 'file',
      from,
      to,
      scene,
    })
  }

  const onEmojiClick = (tag: string) => {
    const input = inputRef.current.resizableTextArea.textArea
    input?.focus()
    input?.setRangeText(tag, input.selectionStart, input.selectionEnd, 'end')
    input?.blur()
    setValue(input.value)
  }

  const handleVisibleChange = (newVisible: boolean) => {
    setVisible(newVisible)
  }

  const emojiContent = (
    <>
      {Object.keys(Constant.EMOJI_ICON_MAP_CONFIG).map((tag: string, index) => (
        <span
          onClick={() => {
            onEmojiClick(tag)
            setVisible(false)
          }}
          className={`${_prefix}-emoji-item`}
          title={tag}
          key={index}
        >
          <CommonIcon
            className={`${_prefix}-emoji-item-icon`}
            type={Constant.EMOJI_ICON_MAP_CONFIG[tag]}
          />
        </span>
      ))}
    </>
  )

  const isMute = useMemo(() => {
    return (teamInfo as ITeamInfo).mute && !isGroupOwner && !isGroupManager
  }, [teamInfo, isGroupOwner, isGroupManager])

  return (
    <div className={`${_prefix}-wrap`}>
      {/* <div className={`${_prefix}-msg-tip`}>
        <ArrowDownOutlined className={`${_prefix}-msg-tip-icon`} />
        您有新消息
      </div> */}
      <TextArea
        ref={inputRef}
        bordered={false}
        className={`${_prefix}-textarea`}
        placeholder={placeholder}
        value={value}
        disabled={isMute}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        onPressEnter={onPressEnterHandler}
        autoSize={{ maxRows: 5 }}
      />
      <div className={`${_prefix}-icon-box`}>
        <Button type="text" disabled={isMute}>
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

        <Button size="small" disabled={isMute}>
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

        <Button size="small" disabled={isMute}>
          {uploadFileLoading ? (
            <Spin indicator={antIcon} />
          ) : (
            <Upload
              beforeUpload={onBeforeUploadHandler}
              showUploadList={false}
              disabled={isMute}
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
  )
}

export default ChatMessageInput
