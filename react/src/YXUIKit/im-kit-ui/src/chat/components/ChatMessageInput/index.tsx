import React, {
  useState,
  useRef,
  Fragment,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react'
import { Input, Upload, Popover, message, Button, Spin } from 'antd'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import {
  CommonIcon,
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
import { TextAreaRef } from 'antd/lib/input/TextArea'
import { FriendProfile, TeamMember } from '@xkit-yx/im-store'
import ChatAtMemberList, { MentionedMember } from './ChatMentionMemberList'

const { TextArea } = Input

type Member = TeamMember & Partial<FriendProfile>

export interface ChatMessageInputProps {
  prefix?: string
  commonPrefix?: string
  placeholder?: string
  replyMsg?: IMMessage
  mentionMembers?: Member[]
  scene: TMsgScene
  to: string
  actions?: Action[]
  mute?: boolean
  inputValue?: string
  uploadImageLoading?: boolean
  uploadFileLoading?: boolean
  setInputValue: (value: string) => void
  onSendText: (value: string, ext?: Record<string, unknown>) => void
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

export interface ChatMessageInputRef {
  onAtMemberSelectHandler: (member: MentionedMember) => void
  setSelectedAtMembers: React.Dispatch<React.SetStateAction<MentionedMember[]>>
  input?: HTMLTextAreaElement
}

const ChatMessageInput = observer(
  forwardRef<
    ChatMessageInputRef,
    React.PropsWithChildren<ChatMessageInputProps>
  >((props, ref) => {
    const {
      prefix = 'chat',
      commonPrefix = 'common',
      placeholder = '',
      mentionMembers,
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
    const _prefix = `${prefix}-message-input`

    const { t } = useTranslation()
    const { store } = useStateContext()

    const textAreaRef = useRef<TextAreaRef>(null)
    const popupContainerRef = useRef<HTMLDivElement>(null)
    const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
    const [atVisible, setAtVisible] = useState<boolean>(false)
    const [atMemberSearchText, setAtMemberSearchText] = useState<string>('')
    const [selectedAtMembers, setSelectedAtMembers] = useState<
      MentionedMember[]
    >([])

    const { EMOJI_ICON_MAP_CONFIG } = Utils.handleEmojiTranslate(t)

    const LoadingIcon = (
      <LoadingOutlined className={`${_prefix}-loading-spin`} spin />
    )

    const defaultActions: Action[] = [
      {
        action: 'emoji',
        visible: true,
        render: () => {
          return (
            <Button type="text" disabled={mute}>
              <Popover
                trigger="click"
                visible={emojiVisible}
                overlayClassName={`${_prefix}-emoji-box`}
                content={emojiContent}
                onVisibleChange={setEmojiVisible}
              >
                <CommonIcon
                  className={`${_prefix}-icon-emoji`}
                  type="icon-biaoqing"
                />
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
                <Spin indicator={LoadingIcon} />
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
                <Spin indicator={LoadingIcon} />
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

    const filterAtMembers = useMemo(() => {
      if (atMemberSearchText) {
        const res = mentionMembers?.filter((member) => {
          return member.alias?.includes(atMemberSearchText.replace('@', ''))
        })
        if (res?.length) {
          setAtVisible(true)
        } else {
          setAtVisible(false)
        }
        return res
      } else {
        setAtVisible(false)
        return mentionMembers
      }
    }, [mentionMembers, atMemberSearchText])

    const onAtMembersExtHandler = () => {
      let ext
      if (selectedAtMembers.length) {
        selectedAtMembers.forEach((member) => {
          const substr = `@${member.nickInTeam} `
          const positions: number[] = []
          let pos = inputValue.indexOf(substr)
          while (pos !== -1) {
            positions.push(pos)
            pos = inputValue.indexOf(substr, pos + 1)
          }
          if (positions.length) {
            if (!ext) {
              ext = {
                yxAitMsg: {
                  [member.account]: {
                    text: substr,
                    segments: [],
                  },
                },
              }
            } else {
              ext.yxAitMsg[member.account] = {
                text: substr,
                segments: [],
              }
            }
            positions.forEach((position) => {
              const start = position
              ext.yxAitMsg[member.account].segments.push({
                start,
                end: start + substr.length - 1,
                broken: false,
              })
            })
          }
        })
      }
      return ext
    }

    const onTextAreaSelectionRangeHandler = () => {
      function getCursorPosition(
        cursorIndex: number
      ): { selectionStart: number; selectionEnd: number } | undefined {
        let selectionStart, selectionEnd
        selectedAtMembers.some((member) => {
          const alias = `@${member.nickInTeam} `
          const regex = new RegExp(alias, 'g')
          let match
          while ((match = regex.exec(inputValue))) {
            const start = match.index
            const end = start + alias.length
            if (cursorIndex > start && cursorIndex < end) {
              selectionStart = start
              selectionEnd = end
              return true
            }
          }
        })
        return {
          selectionStart: selectionStart ?? cursorIndex,
          selectionEnd: selectionEnd ?? cursorIndex,
        }
      }
      setTimeout(() => {
        const input = textAreaRef.current?.resizableTextArea?.textArea

        if (input) {
          const selectionStart =
            getCursorPosition(input.selectionStart)?.selectionStart ??
            input.selectionStart
          const selectionEnd =
            getCursorPosition(input.selectionEnd)?.selectionEnd ??
            input.selectionEnd
          input.setSelectionRange(selectionStart, selectionEnd)
        }
      }, 0)
    }

    const onInputChangeHandler = (e: any) => {
      const newValue = e.target.value as string
      const input = textAreaRef.current?.resizableTextArea?.textArea
      let atMemberSearchText = ''
      if (input) {
        const cursorIndex = input.selectionStart
        const subStr = newValue.slice(0, cursorIndex)
        const atIndex = subStr.lastIndexOf('@')
        if (atIndex !== -1) {
          atMemberSearchText = newValue.slice(atIndex, cursorIndex)
        }
      }
      setAtMemberSearchText(atMemberSearchText)
      setInputValue(newValue)
    }

    const onAtMemberSelectHandler = useCallback(
      (member: MentionedMember) => {
        setSelectedAtMembers([
          ...selectedAtMembers.filter(
            (item) => item.account !== member.account
          ),
          member,
        ])
        const input = textAreaRef.current?.resizableTextArea?.textArea
        if (input) {
          input.focus()
          input.setRangeText(
            `@${member.nickInTeam} `,
            atVisible
              ? input.selectionStart - atMemberSearchText.length
              : input.selectionStart,
            input.selectionEnd,
            'end'
          )
          setInputValue(input.value)
        }
        setAtMemberSearchText('')
      },
      [atMemberSearchText, selectedAtMembers, setInputValue, atVisible]
    )

    const onPressEnterHandler = (
      e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      if (atVisible) {
        e.preventDefault()
        return
      }
      const trimValue = inputValue.trim()
      if (!e.shiftKey) {
        e.preventDefault()
        if (!trimValue) {
          message.warning(t('sendEmptyText'))
          return
        }
        onSendText(inputValue, onAtMembersExtHandler())
        setInputValue('')
        setSelectedAtMembers([])
      }
    }

    const onKeyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setAtVisible(false)
        onTextAreaSelectionRangeHandler()
      } else if (['ArrowUp', 'ArrowDown'].includes(e.key) && atVisible) {
        e.nativeEvent.preventDefault()
      } else if (e.key === 'Backspace') {
        const input = textAreaRef.current?.resizableTextArea?.textArea
        if (input) {
          const cursorIndex = input?.selectionStart
          let atIndex
          selectedAtMembers.some((member) => {
            const alias = `@${member.nickInTeam} `
            const regex = new RegExp(alias, 'g')
            let match
            while ((match = regex.exec(inputValue))) {
              const start = match.index
              const end = start + alias.length
              if (cursorIndex === end) {
                atIndex = start
                return true
              }
            }
          })
          if (atIndex !== undefined) {
            e.nativeEvent.preventDefault()
            setInputValue(
              inputValue.slice(0, atIndex) + inputValue.slice(cursorIndex)
            )
            setTimeout(() => {
              input.setSelectionRange(atIndex, atIndex)
            }, 0)
          }
        }
      }
    }

    const onClickHandler = onTextAreaSelectionRangeHandler

    const onBeforeUploadHandler = (
      file: File
    ): boolean | Promise<void | Blob | File> => {
      const isLimit = file.size / 1024 / 1000 > MAX_UPLOAD_FILE_SIZE

      if (isLimit) {
        message.error(
          `${t('uploadLimitText')}${MAX_UPLOAD_FILE_SIZE}${t(
            'uploadLimitUnit'
          )}`
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
      const input = textAreaRef.current?.resizableTextArea?.textArea
      if (input) {
        input.focus()
        input.setRangeText(tag, input.selectionStart, input.selectionEnd, 'end')
        setInputValue(input.value)
      }
      setEmojiVisible(false)
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
      if (replyMsg) {
        const nick = store.uiStore.getAppellation({
          account: replyMsg.from,
          teamId: replyMsg.scene === 'team' ? replyMsg.to : undefined,
          ignoreAlias: true,
        })
        let content = `${t('replyText')} ${nick}：`
        content += replyMsg ? getMsgContentTipByType(replyMsg, t) : ''
        return <div className={`${_prefix}-reply-content`}>{content}</div>
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        onAtMemberSelectHandler,
        setSelectedAtMembers,
        input: textAreaRef.current?.resizableTextArea?.textArea,
      }),
      [onAtMemberSelectHandler]
    )

    return (
      <div className={`${prefix}-message-input`}>
        <div className={`${_prefix}-wrap`}>
          <Popover
            visible={atVisible}
            trigger={[]}
            content={
              <ChatAtMemberList
                prefix={prefix}
                commonPrefix={commonPrefix}
                mentionMembers={filterAtMembers}
                onSelect={onAtMemberSelectHandler}
              />
            }
            overlayClassName={`${_prefix}-at-popover`}
            getPopupContainer={(triggerNode) =>
              popupContainerRef.current || triggerNode
            }
            onVisibleChange={setAtVisible}
            destroyTooltipOnHide
          >
            <div
              className={`${_prefix}-popup-container`}
              ref={popupContainerRef}
            />
          </Popover>
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
              ref={textAreaRef}
              bordered={false}
              className={`${_prefix}-textarea`}
              placeholder={placeholder}
              value={inputValue}
              disabled={mute}
              onInput={onInputChangeHandler}
              onPressEnter={onPressEnterHandler}
              onKeyDown={onKeyDownHandler}
              onClick={onClickHandler}
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
          </div>
        </div>
      </div>
    )
  })
)

export default ChatMessageInput
