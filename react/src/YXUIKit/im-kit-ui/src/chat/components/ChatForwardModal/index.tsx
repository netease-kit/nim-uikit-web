import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Checkbox, Input, Tabs } from 'antd'
import {
  useTranslation,
  ComplexAvatarContainer,
  useStateContext,
  CrudeAvatar,
  SelectModal,
} from '../../../common'
import { SelectModalItemProps } from '../../../common/components/SelectModal'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { groupByPy, logger } from '../../../utils'
import { observer } from 'mobx-react'

const localStorageKey = '__yx_im_recent_forward__'
const localStorageMax = 5
const selectedMax = 9

export type TabKey = 'conversation' | 'friend' | 'team'

export interface ChatRecentForwardItem extends SelectModalItemProps {
  time: number
}

export interface ChatForwardModalProps {
  msg?: V2NIMMessageForUI
  visible: boolean
  onSend: () => void
  onCancel: () => void

  prefix?: string
  commonPrefix?: string
}

const ChatMessageForwardModal: React.FC<ChatForwardModalProps> = observer(
  ({
    msg,
    visible,
    onCancel,
    onSend,
    prefix = 'chat',
    commonPrefix = 'common',
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

    const teams = store.uiStore.teamList.map((item) => ({
      key: nim.V2NIMConversationIdUtil.teamConversationId(item.teamId),
      label: item.name || item.teamId,
      hide: tab !== 'team',
    }))

    const conversations = [...store.conversationStore.conversations.values()]
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
      const handleRecentSelect = (value: any) => {
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

    const handleCommentChange = (e: any) => {
      setComment(e.target.value)
    }

    const resetState = () => {
      setComment('')
      setTab('conversation')
      setSelected([])
    }

    const handleOk = async (data: SelectModalItemProps[]) => {
      if (msg) {
        const handler = (params: SelectModalItemProps) =>
          store.msgStore.forwardMsgActive(msg, params.key, comment)

        try {
          // 保存5条最新的转发
          const finalData = getUniqueLatestItems(
            data
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
          // 多选转发无论成功失败都当做成功处理，没有提示
          await Promise.all(data.map((item) => handler(item)))
        } catch (error) {
          logger.error('forwardFailed', error)
        } finally {
          onSend()
        }
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
        type="checkbox"
        max={selectedMax}
        min={1}
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
