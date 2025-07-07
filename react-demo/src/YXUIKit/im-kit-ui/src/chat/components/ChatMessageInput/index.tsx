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
import { Input, Upload, Popover, message, Button, Dropdown, Menu } from 'antd'
import {
  CommonIcon,
  getMsgContentTipByType,
  Utils,
  useTranslation,
  useStateContext,
} from '../../../common'
import { Action } from '../../Container'
import { storeConstants } from '@xkit-yx/im-store-v2'
import { CloseOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { TextAreaRef } from 'antd/lib/input/TextArea'
import ChatAtMemberList, { MentionedMember } from './ChatMentionMemberList'
import { mergeActions } from '../../../utils'
import {
  V2NIMMessageForUI,
  YxAitMsg,
  YxServerExt,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMTeamMember } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import { V2NIMConversationType } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMConversationService'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { V2NIMAIUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService'
import { useImgPaste } from './useImgPaste'

const { TextArea } = Input

export interface ChatMessageInputProps {
  prefix?: string
  commonPrefix?: string
  placeholder?: string
  replyMsg?: V2NIMMessageForUI
  mentionMembers?: (V2NIMTeamMember | V2NIMAIUser)[]
  conversationType: V2NIMConversationType
  receiverId: string
  actions?: Action[]
  mute?: boolean
  allowAtAll?: boolean
  inputValue?: string
  translateOpen: boolean
  maxUploadFileSize: number
  enableSendVideo?: boolean
  setInputValue: (value: string) => void
  onTranslate: (open: boolean) => void
  onSendText: (value: string, ext?: YxServerExt) => void
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
  >(function ChatMessageInputContent(props, ref) {
    const {
      prefix = 'chat',
      commonPrefix = 'common',
      placeholder = '',
      mentionMembers,
      actions,
      receiverId,
      mute = false,
      allowAtAll = true,
      enableSendVideo = true,
      inputValue = '',
      translateOpen,
      replyMsg,
      maxUploadFileSize,
      setInputValue,
      onTranslate,
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

    const { SHOW_EMOJI_ICON_MAP_CONFIG } = Utils.handleEmojiTranslate(t)

    const onTranslateHandler = () => {
      onTranslate(!translateOpen)
    }

    const defaultActions: Action[] = [
      {
        action: 'emoji',
        visible: true,
        render: () => {
          return (
            <Button size="small" disabled={mute}>
              <Popover
                trigger="click"
                open={emojiVisible}
                overlayClassName={`${_prefix}-emoji-box`}
                content={emojiContent}
                onOpenChange={(flag) => setEmojiVisible(flag)}
              >
                <div>
                  <CommonIcon
                    className={`${_prefix}-icon-emoji`}
                    type="icon-biaoqing"
                  />
                </div>
              </Popover>
            </Button>
          )
        },
      },
      {
        action: 'sendImg',
        visible: true,
        render: () => {
          return enableSendVideo ? (
            <Button size="small" disabled={mute}>
              <Dropdown
                placement="top"
                arrow={false}
                overlay={
                  <Menu
                    className={`${_prefix}-icon-box-img`}
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
                            <div>
                              <CommonIcon
                                className={`${_prefix}-icon-image`}
                                type="icon-tupian"
                              />
                              <span style={{ padding: '0 5px 0 3px' }}>
                                {t('imgText')}
                              </span>
                            </div>
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
                            <div>
                              <CommonIcon
                                className={`${_prefix}-icon-image`}
                                type="icon-shipin8"
                              />
                              <span style={{ padding: '0 5px 0 3px' }}>
                                {t('videoText')}
                              </span>
                            </div>
                          </Upload>
                        ),
                      },
                    ]}
                  />
                }
              >
                <div>
                  <CommonIcon
                    className={`${_prefix}-icon-image`}
                    type="icon-tupian"
                  />
                </div>
              </Dropdown>
            </Button>
          ) : (
            <Button size="small" disabled={mute}>
              <Upload
                beforeUpload={onBeforeUploadImgHandler}
                showUploadList={false}
                accept=".jpg,.png,.jpeg,.gif"
                // action={onUploadImgHandler}
                className={`${_prefix}-icon-upload`}
              >
                <div>
                  <CommonIcon
                    className={`${_prefix}-icon-image`}
                    type="icon-tupian"
                  />
                </div>
              </Upload>
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
            </Button>
          )
        },
      },
      {
        action: 'aiTranslate',
        visible:
          localOptions.aiVisible && !!store.aiUserStore.getAITranslateUser(),
        render: () => {
          return (
            <Button onClick={onTranslateHandler} size="small" disabled={mute}>
              <CommonIcon
                className={
                  translateOpen
                    ? `${_prefix}-icon-translate-active`
                    : `${_prefix}-icon-translate`
                }
                type="icon-a-rongqi484"
              />
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

    // 消息右键菜单
    const finalActions = actions
      ? mergeActions(defaultActions, actions, 'action')
      : defaultActions

    // @成员处理
    const filterAtMembers = useMemo(() => {
      if (atMemberSearchText) {
        const res = mentionMembers?.filter((member) => {
          return store.uiStore
            .getAppellation({
              account: member.accountId,
              teamId: (member as V2NIMTeamMember).teamId,
            })
            ?.includes(atMemberSearchText.replace('@', ''))
        })

        return res
      } else {
        return mentionMembers
      }
    }, [mentionMembers, atMemberSearchText, store.uiStore])

    const onAtMembersExtHandler = () => {
      let ext: YxServerExt | void = void 0

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
                ;(ext.yxAitMsg as YxAitMsg)[member.account] = {
                  text: substr,
                  segments: [],
                }
              }

              positions.forEach((position) => {
                const start = position

                ;(ext?.yxAitMsg as YxAitMsg)[member.account].segments.push({
                  start,
                  end: start + substr.length - 1,
                  broken: false,
                })
              })
            }
          })
      }

      return ext as unknown as YxServerExt
    }

    // 用户处理input中的@成员昵称
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

    // 点击发送消息
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

    // 回车发送
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

    // 键盘相关事件处理 @相关
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

    // 文件上传前处理
    const onBeforeUploadFileHandler = (
      file: File
    ): boolean | Promise<void | Blob | File> => {
      const isLimit = file.size / 1024 / 1000 > maxUploadFileSize

      if (isLimit) {
        message.error(
          `${t('uploadLimitText')}${maxUploadFileSize}${t('uploadLimitUnit')}`
        )
      } else {
        onSendFile(file)
      }

      return false
    }

    // 图片上传前处理
    const onBeforeUploadImgHandler = (
      file: File
    ): boolean | Promise<void | Blob | File> => {
      const isLimit = file.size / 1024 / 1000 > maxUploadFileSize

      if (isLimit) {
        message.error(
          `${t('uploadLimitText')}${maxUploadFileSize}${t('uploadLimitUnit')}`
        )
      } else {
        onSendImg(file)
      }

      return false
    }

    // 视频上传前处理
    const onBeforeUploadVideoHandler = (
      file: File
    ): boolean | Promise<void | Blob | File> => {
      const isLimit = file.size / 1024 / 1000 > maxUploadFileSize

      if (isLimit) {
        message.error(
          `${t('uploadLimitText')}${maxUploadFileSize}${t('uploadLimitUnit')}`
        )
      } else {
        onSendVideo(file)
      }

      return false
    }

    // 点击表情
    const onEmojiClickHandler = (tag: string) => {
      const input = textAreaRef.current?.resizableTextArea?.textArea

      if (input) {
        input.focus()
        input.setRangeText(tag, input.selectionStart, input.selectionEnd, 'end')
        setInputValue(input.value)
      }

      setEmojiVisible(false)
    }

    // 键盘上方的回复消息
    const replyMsgContent = () => {
      if (replyMsg) {
        const isAiResponseMessage =
          replyMsg?.aiConfig?.aiStatus ===
          V2NIMConst.V2NIMMessageAIStatus.V2NIM_MESSAGE_AI_STATUS_RESPONSE

        /**renderSenderId 用于渲染头像和昵称，当这条消息是ai发的消息，会存在如下情况
         * 1.如果是单聊，此时有ai的回复消息，那么sdk返回的消息的senderId为提问者的accountId，但此时UI上需要展示为ai的昵称和头像，将renderSenderId改为ai的accountId
         * 2.如果是群聊，此时有ai的回复消息且ai数字人不在群里，那么sdk返回的消息的senderId为ai的accountId，但此时UI上需要展示为ai的昵称和头像，将renderSenderId改为ai的accountId
         **/

        const renderSenderId = isAiResponseMessage
          ? replyMsg?.aiConfig?.accountId
          : replyMsg.senderId

        const nick = store.uiStore.getAppellation({
          account: renderSenderId as string,
          teamId:
            replyMsg.conversationType ===
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
              ? replyMsg.receiverId
              : undefined,
          ignoreAlias: true,
        })
        const content: React.ReactNode[] = [
          <>{`${t('replyText')} ${nick}：`}</>,
        ]

        content.push(replyMsg ? getMsgContentTipByType(replyMsg, t) : '')

        return (
          <div className={`${_prefix}-reply-content`}>
            {content.map((item, index) => {
              return <span key={index}>{item}</span>
            })}
          </div>
        )
      }
    }

    const emojiContent = (
      <>
        {Object.keys(SHOW_EMOJI_ICON_MAP_CONFIG).map((tag: string) => (
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
              type={SHOW_EMOJI_ICON_MAP_CONFIG[tag]}
            />
          </span>
        ))}
      </>
    )

    // 粘贴图片发送
    const { handleImgPaste } = useImgPaste({ onSendImg })

    useEffect(() => {
      if (textAreaRef.current) {
        textAreaRef?.current?.focus()
        textAreaRef.current.resizableTextArea?.textArea.addEventListener(
          'paste',
          handleImgPaste
        )
      }

      return () => {
        textAreaRef.current?.resizableTextArea?.textArea.removeEventListener(
          'paste',
          handleImgPaste
        )
      }
    }, [textAreaRef, store.uiStore.selectedConversation])

    useEffect(() => {
      setAtMemberSearchText('')
      setAtVisible(false)
    }, [receiverId])

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
              // antd 问题 onInput会出现在火狐浏览器上无法输入中文 此处改为onchange
              //onInput={onInputChangeHandler}
              onChange={onInputChangeHandler}
              onPressEnter={onPressEnterHandler}
              onKeyDown={onKeyDownHandler}
              onClick={onClickHandler}
              autoSize={{ maxRows: 3 }}
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
