import React, {
  useState,
  useRef,
  Fragment,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
} from 'react'
import {
  Input,
  Upload,
  Popover,
  message,
  Button,
  Spin,
  Dropdown,
  Menu,
} from 'antd'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import {
  CommonIcon,
  getMsgContentTipByType,
  Utils,
  useTranslation,
  useStateContext,
} from '../../../common'
import { Action } from '../../Container'
import { MAX_UPLOAD_FILE_SIZE } from '../../../constant'
import { storeConstants } from '@xkit-yx/im-store'
import { LoadingOutlined, CloseOutlined } from '@ant-design/icons'
import { TMsgScene } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { observer } from 'mobx-react'
import { TextAreaRef } from 'antd/lib/input/TextArea'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import ChatAtMemberList, { MentionedMember } from './ChatMentionMemberList'
import { mergeActions } from '../../../utils'

const { TextArea } = Input

export interface ChatMessageInputProps {
  prefix?: string
  commonPrefix?: string
  placeholder?: string
  replyMsg?: IMMessage
  mentionMembers?: TeamMember[]
  scene: TMsgScene
  to: string
  actions?: Action[]
  mute?: boolean
  allowAtAll?: boolean
  inputValue?: string
  uploadImageLoading?: boolean
  uploadFileLoading?: boolean
  setInputValue: (value: string) => void
  onSendText: (value: string, ext?: Record<string, unknown>) => void
  onSendFile: (file: File) => void
  onSendImg: (file: File) => void
  onSendVideo: (file: File) => void
  onRemoveReplyMsg?: () => void
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
      allowAtAll = true,
      inputValue = '',
      uploadImageLoading = false,
      uploadFileLoading = false,
      replyMsg,
      setInputValue,
      onSendText,
      onSendFile,
      onSendImg,
      onSendVideo,
      onRemoveReplyMsg,
    } = props
    const _prefix = `${prefix}-message-input`

    const { t } = useTranslation()
    const { store, localOptions } = useStateContext()

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
            <Button size="small" disabled={mute}>
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
              <Dropdown
                placement="top"
                arrow={false}
                overlay={
                  <Menu
                    items={[
                      {
                        key: 'sendImg',
                        label: (
                          <Upload
                            beforeUpload={onBeforeUploadImgHandler}
                            showUploadList={false}
                            accept=".jpg,.png,.jpeg,.gif"
                            // action={onUploadImgHandler}
                            className={`${_prefix}-icon-upload`}
                          >
                            <CommonIcon
                              className={`${_prefix}-icon-image`}
                              type="icon-tupian"
                            />
                            <span style={{ padding: '0 30px 0 3px' }}>
                              {t('imgText')}
                            </span>
                          </Upload>
                        ),
                      },
                      {
                        key: 'sendVideo',
                        label: (
                          <Upload
                            beforeUpload={onBeforeUploadVideoHandler}
                            showUploadList={false}
                            accept=".mp4,.mov,.avi,.wmv,.mkv,.flv,.rmvb,.3gp,.mpeg,.m4v,.vob,.webm"
                            // action={onUploadImgHandler}
                            className={`${_prefix}-icon-upload`}
                          >
                            <CommonIcon
                              className={`${_prefix}-icon-image`}
                              type="icon-shipin8"
                            />
                            <span style={{ padding: '0 30px 0 3px' }}>
                              {t('videoText')}
                            </span>
                          </Upload>
                        ),
                      },
                    ]}
                  />
                }
              >
                <CommonIcon
                  className={`${_prefix}-icon-image`}
                  type="icon-tupian"
                />
              </Dropdown>
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
                  beforeUpload={onBeforeUploadFileHandler}
                  showUploadList={false}
                  disabled={mute}
                  // action={onUploadFileHandler}
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
      {
        action: 'sendMsg',
        visible: true,
        render: () => {
          return (
            <Button
              onClick={onClickSendMsgHandler}
              size="small"
              disabled={mute}
            >
              <CommonIcon
                className={
                  mute
                    ? `${_prefix}-icon-msg`
                    : inputValue
                    ? `${_prefix}-icon-msg-select`
                    : `${_prefix}-icon-msg`
                }
                type="icon-fasong"
              />
            </Button>
          )
        },
      },
    ]

    const finalActions = actions
      ? mergeActions(defaultActions, actions, 'action')
      : defaultActions

    const filterAtMembers = useMemo(() => {
      if (atMemberSearchText) {
        const res = mentionMembers?.filter((member) => {
          return store.uiStore
            .getAppellation({
              account: member.account,
              teamId: member.teamId,
            })
            ?.includes(atMemberSearchText.replace('@', ''))
        })
        return res
      } else {
        return mentionMembers
      }
    }, [mentionMembers, atMemberSearchText, store.uiStore])

    useEffect(() => {
      setAtMemberSearchText('')
      setAtVisible(false)
    }, [to])

    useEffect(() => {
      if (atMemberSearchText) {
        if (filterAtMembers?.length) {
          setAtVisible(true)
        } else {
          setAtVisible(false)
        }
      } else {
        setAtVisible(false)
      }
    }, [filterAtMembers, atMemberSearchText])

    const onAtMembersExtHandler = () => {
      let ext
      if (selectedAtMembers.length) {
        selectedAtMembers
          .filter((member) => {
            if (
              !allowAtAll &&
              member.account === storeConstants.AT_ALL_ACCOUNT
            ) {
              return false
            }
            return true
          })
          .forEach((member) => {
            const substr = `@${member.appellation} `
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
          const alias = `@${member.appellation} `
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
        //当needMention为false时  避免不必要的计算
        if (input && localOptions.needMention) {
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
      if (localOptions.needMention) {
        setAtMemberSearchText(atMemberSearchText)
      }
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
            `@${member.appellation} `,
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

    const onClickSendMsgHandler = (e) => {
      if (atVisible) {
        e.preventDefault()
        setAtVisible(false)
        setAtMemberSearchText('')
        return
      }
      const trimValue = inputValue.trim()
      if (!trimValue) {
        message.warning(t('sendEmptyText'))
        return
      }
      onSendText(inputValue, onAtMembersExtHandler())
      setInputValue('')
      setSelectedAtMembers([])
    }

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
            const alias = `@${member.appellation} `
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

    const onBeforeUploadFileHandler = (
      file: File
    ): boolean | Promise<void | Blob | File> => {
      const isLimit = file.size / 1024 / 1000 > MAX_UPLOAD_FILE_SIZE

      if (isLimit) {
        message.error(
          `${t('uploadLimitText')}${MAX_UPLOAD_FILE_SIZE}${t(
            'uploadLimitUnit'
          )}`
        )
      } else {
        onSendFile(file)
      }

      return false
    }

    const onBeforeUploadImgHandler = (
      file: File
    ): boolean | Promise<void | Blob | File> => {
      const isLimit = file.size / 1024 / 1000 > MAX_UPLOAD_FILE_SIZE

      if (isLimit) {
        message.error(
          `${t('uploadLimitText')}${MAX_UPLOAD_FILE_SIZE}${t(
            'uploadLimitUnit'
          )}`
        )
      } else {
        onSendImg(file)
      }

      return false
    }

    const onBeforeUploadVideoHandler = (
      file: File
    ): boolean | Promise<void | Blob | File> => {
      const isLimit = file.size / 1024 / 1000 > MAX_UPLOAD_FILE_SIZE

      if (isLimit) {
        message.error(
          `${t('uploadLimitText')}${MAX_UPLOAD_FILE_SIZE}${t(
            'uploadLimitUnit'
          )}`
        )
      } else {
        onSendVideo(file)
      }

      return false
    }

    // const onUploadImgHandler = (file: any): any => {
    //   onSendImg(file)
    // }
    // const onUploadFileHandler = (file: any): any => {
    //   onSendFile(file)
    // }

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
            open={atVisible}
            trigger={[]}
            content={
              <ChatAtMemberList
                allowAtAll={allowAtAll}
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
