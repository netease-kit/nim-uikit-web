/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Checkbox, Input, message, Tabs } from 'antd'
import {
  useTranslation,
  ComplexAvatarContainer,
  useStateContext,
  CrudeAvatar,
  SelectModal,
  getMsgContentTipByType,
} from '../../../common'
import { SelectModalItemProps } from '../../../common/components/SelectModal'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { groupByPy, logger, getFileMd5 } from '../../../utils'
import { observer } from 'mobx-react'
import packageJson from '../../../../package.json'
import sdkPkg from 'nim-web-sdk-ng/package.json'

const localStorageKey = '__yx_im_recent_forward__'
const localStorageMax = 5
const selectedMax = 9

const appVersion = packageJson.version
const sdkVersion = sdkPkg.version

export type TabKey = 'conversation' | 'friend' | 'team'

export interface ChatRecentForwardItem extends SelectModalItemProps {
  time: number
}

export interface ChatForwardModalProps {
  msg?: V2NIMMessageForUI
  msgs?: V2NIMMessageForUI[]
  mergeMsg?: boolean
  visible: boolean
  onSend: () => void
  onCancel: () => void

  prefix?: string
  commonPrefix?: string
  selectType?: 'checkbox' | 'radio'
}

const ChatMessageForwardModal: React.FC<ChatForwardModalProps> = observer(
  ({
    msg,
    msgs,
    mergeMsg = true,
    visible,
    onCancel,
    onSend,
    prefix = 'chat',
    commonPrefix = 'common',
    selectType = 'checkbox',
  }) => {
    const { t } = useTranslation()
    const { nim, store } = useStateContext()

    const [comment, setComment] = useState('')
    const [tab, setTab] = useState<TabKey>('conversation')
    const [selected, setSelected] = useState<string[]>([])

    const myAccount = store.userStore.myUserInfo.accountId

    // 用于获取最近转发列表
    const finalStoreKey = `${localStorageKey}-${myAccount}`

    const _prefix = `${prefix}-forward-modal`

    const friends = groupByPy(
      store.uiStore.friends
        .filter(
          (item) => !store.relationStore.blacklist.includes(item.accountId)
        )
        .map((item) => ({
          key: nim.V2NIMConversationIdUtil.p2pConversationId(item.accountId),
          label: store.uiStore.getAppellation({ account: item.accountId }),
          hide: tab !== 'friend',
        })),
      {
        firstKey: 'label',
      },
      false
    )
      .map((item) => item.data)
      .flat()
    const _conversation = store.sdkOptions?.enableV2CloudConversation
      ? [...store.uiStore.conversations.values()]
      : [...store.uiStore.localConversations.values()]
    const conversations = _conversation
      .sort((a, b) => b.sortOrder - a.sortOrder)
      .map((item) => {
        if (
          item.type ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
        ) {
          return {
            key: item.conversationId,
            label: store.uiStore.getAppellation({
              account: nim.V2NIMConversationIdUtil.parseConversationTargetId(
                item.conversationId
              ),
            }),
          }
        }

        if (
          item.type ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ) {
          const teamId = nim.V2NIMConversationIdUtil.parseConversationTargetId(
            item.conversationId
          )
          const team = store.teamStore.teams.get(teamId)

          if (!team) {
            return null
          }

          return {
            key: item.conversationId,
            label: team.name || team.teamId || '',
          }
        }

        return null
      })
      .filter((item) => !!item)
      .map((item) => ({
        ...item,
        hide: tab !== 'conversation',
      })) as SelectModalItemProps[]

    const teams = store.uiStore.teamList.map((item) => ({
      key: nim.V2NIMConversationIdUtil.teamConversationId(item.teamId),
      label: item.name || item.teamId,
      hide: tab !== 'team',
    }))

    const dataSource = [...conversations, ...friends, ...teams]

    const recentForward = useMemo(() => {
      let res: ChatRecentForwardItem[] = []

      if (visible) {
        try {
          res = JSON.parse(localStorage.getItem(finalStoreKey) || '[]')
        } catch (error) {
          //
        }
      }

      return res
    }, [visible, finalStoreKey])

    const itemAvatarRender = useCallback(
      (data: SelectModalItemProps) => {
        const to = nim.V2NIMConversationIdUtil.parseConversationTargetId(
          data.key
        )
        const conversationType =
          nim.V2NIMConversationIdUtil.parseConversationType(data.key)

        if (
          conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
        ) {
          return (
            <ComplexAvatarContainer
              prefix={commonPrefix}
              canClick={false}
              account={to}
              size={32}
            />
          )
        }

        if (
          conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ) {
          const team = store.teamStore.teams.get(to)

          return (
            <CrudeAvatar
              account={to}
              avatar={team?.avatar || ''}
              nick={team?.name || ''}
              size={32}
            />
          )
        }

        return null
      },
      [commonPrefix, nim.V2NIMConversationIdUtil, store.teamStore.teams]
    )

    const recentSelected = useMemo(() => {
      return selected.filter((item) =>
        recentForward.some((j) => j.key === item)
      )
    }, [selected, recentForward])

    const recentRenderer = useMemo(() => {
      const handleRecentSelect = (value: any[]) => {
        if (value.length > recentSelected.length) {
          // 合并并去重
          setSelected([...new Set([...selected, ...value])])
        } else if (value.length < recentSelected.length) {
          // 找出 value 相比于 recentSelected 少掉的项
          const diff = recentSelected.filter((item) => !value.includes(item))

          // 从 selected 中删除 diff
          setSelected(selected.filter((item) => !diff.includes(item)))
        }
      }

      return recentForward.length ? (
        <div className={`${_prefix}-recent`}>
          <span className={`${_prefix}-recent-title`}>
            {t('recentForwardText')}
          </span>
          <Checkbox.Group
            className={`${_prefix}-recent-group`}
            onChange={handleRecentSelect}
            value={recentSelected}
            disabled={selected.length >= selectedMax}
          >
            {recentForward.map((item) => (
              <div key={item.key} className={`${_prefix}-recent-item`}>
                {itemAvatarRender(item)}
                <span className={`${_prefix}-recent-label`} title={item.label}>
                  {item.label}
                </span>
                <Checkbox value={item.key} />
              </div>
            ))}
          </Checkbox.Group>
        </div>
      ) : null
    }, [t, recentForward, itemAvatarRender, selected, recentSelected, _prefix])

    const tabRenderer = useMemo(() => {
      const items: {
        key: TabKey
        label: string
      }[] = [
        {
          key: 'conversation',
          label: t('recentConversationText'),
        },
        {
          key: 'friend',
          label: t('friendListTitle'),
        },
        {
          key: 'team',
          label: t('teamListTitle'),
        },
      ]

      return (
        <Tabs
          className={`${_prefix}-tabs`}
          items={items}
          activeKey={tab}
          onTabClick={(key) => {
            setTab(key as TabKey)
          }}
        />
      )
    }, [t, tab, _prefix])

    const getUniqueLatestItems = (items: ChatRecentForwardItem[]) => {
      const map = new Map<string, ChatRecentForwardItem>()

      items.forEach((item) => {
        const exist = map.get(item.key)

        if (!exist || exist.time < item.time) {
          map.set(item.key, item)
        }
      })
      return [...map.values()]
        .sort((a, b) => b.time - a.time)
        .slice(0, localStorageMax)
    }

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setComment(e.target.value)
    }

    const resetState = () => {
      setComment('')
      setTab('conversation')
      setSelected([])
    }

    const handleOk = async (data: SelectModalItemProps[]) => {
      const targets = selectType === 'radio' ? data.slice(0, 1) : data

      try {
        const finalData = getUniqueLatestItems(
          targets
            .map(
              (item) =>
                ({
                  ...item,
                  time: Date.now(),
                } as ChatRecentForwardItem)
            )
            .concat(recentForward)
        )

        localStorage.setItem(finalStoreKey, JSON.stringify(finalData))

        // 多选转发
        if (msgs && msgs.length && targets[0]) {
          if (mergeMsg) {
            // 序列化消息列表并上传
            const { content: mergedMsgsTxt, depth } =
              store.msgStore.serializeMergeMsgs(msgs, {
                appVersion,
                sdkVersion,
              })

            // 将 mergedMsgs 写入 txt 文件并上传
            const mergedMsgsFile = new File([mergedMsgsTxt], 'mergedMsgs.txt', {
              type: 'text/plain',
            })

            const fileUrl = await store.storageStore.uploadFileActive(
              mergedMsgsFile
            )
            const md5 = await getFileMd5(mergedMsgsFile)

            // 创建合并转发自定义消息
            const abstracts = [...msgs]
              .sort((a, b) => a.createTime - b.createTime)
              .slice(0, 3)
              .map((m) => {
                const senderId = (m as any).__kit__senderId || m.senderId
                const senderNick = store.uiStore.getAppellation({
                  account: senderId,
                })

                const tip = getMsgContentTipByType(
                  {
                    messageType: m.messageType,
                    text: store.msgStore.isChatMergedForwardMsg(m)
                      ? `[${t('chatHistoryText')}]`
                      : m.text || '',
                  },
                  t
                )
                const content = typeof tip === 'string' ? tip : m.text || ''

                return {
                  senderNick,
                  content,
                  userAccId: senderId,
                }
              })

            const sourceConversationId = msgs[0]?.conversationId || ''
            const convType =
              nim.V2NIMConversationIdUtil.parseConversationType(
                sourceConversationId
              )
            const sessionId =
              nim.V2NIMConversationIdUtil.parseConversationTargetId(
                sourceConversationId
              )
            const sessionName =
              convType ===
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                ? store.teamStore.teams.get(sessionId)?.name || sessionId
                : store.uiStore.getAppellation({ account: sessionId })

            const customForwardMsg =
              nim.V2NIMMessageCreator.createCustomMessage(
                `[${t('chatHistoryText')}]`,
                JSON.stringify({
                  type: 101,
                  data: {
                    abstracts,
                    depth,
                    md5,
                    sessionId,
                    sessionName,
                    url: fileUrl,
                  },
                })
              )

            // 发送合并转发自定义消息
            await Promise.all(
              targets.map((item) =>
                store.msgStore.forwardMsgActive(
                  customForwardMsg,
                  item.key,
                  comment
                )
              )
            )
          } else {
            // 逐条转发
            await Promise.all(
              msgs.map((m) =>
                store.msgStore.forwardMsgActive(m, targets[0].key, comment)
              )
            )
          }
        } else if (msg) {
          await Promise.all(
            targets.map((item) =>
              store.msgStore.forwardMsgActive(msg, item.key, comment)
            )
          )
        }

        onSend()
      } catch (error) {
        logger.error('forwardFailed', error)
        message.error(t('forwardSystemErrorText'))
        onCancel()
      }
    }

    const handleSelectChange = useCallback((value: SelectModalItemProps[]) => {
      setSelected(value.map((item) => item.key))
    }, [])

    const handleSelectDelete = (value: SelectModalItemProps) => {
      setSelected(selected.filter((item) => item !== value.key))
    }

    useEffect(() => {
      resetState()
    }, [visible])

    return (
      <SelectModal
        title={t('forwardText')}
        visible={visible}
        tabRenderer={tabRenderer}
        datasource={dataSource}
        defaultValue={selected}
        itemAvatarRender={itemAvatarRender}
        recentRenderer={recentRenderer}
        type={selectType}
        max={selectedMax}
        min={1}
        width={900}
        okText={t('sendBtnText')}
        cancelText={t('cancelText')}
        showLeftTitle={false}
        rightTitle={t('sendToText')}
        bottomRenderer={
          <Input
            className={`${_prefix}-input`}
            placeholder={t('commentText')}
            allowClear
            value={comment}
            onChange={handleCommentChange}
          />
        }
        onSelectChange={handleSelectChange}
        onDelete={handleSelectDelete}
        onOk={handleOk}
        onCancel={onCancel}
        prefix={commonPrefix}
      />
    )
  }
)

export default ChatMessageForwardModal
