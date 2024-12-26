import React, { useState, useEffect, useRef } from 'react'
import { useTranslation, useStateContext } from '../../../common'
import { Empty, Modal, message } from 'antd'
import CollectionItem from './CollectionItem'
import {
  V2NIMCollection,
  V2NIMCollectionOption,
  V2NIMMessage,
} from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'
import { logger } from '../../../utils'
import { V2NIMError } from 'nim-web-sdk-ng/dist/esm/nim/src/types'
import { MenuItem } from '../ChatMessageItem'
import { debounce } from '@xkit-yx/utils'
import ChatForwardModal from '../ChatForwardModal'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'

const LIMIT = 100

export interface CollectionMenuItem extends MenuItem {
  onClick?: (options: {
    collection: V2NIMCollection
    msg: V2NIMMessage
  }) => void
}

export interface CollectionListProps {
  /**
   自定义右键按钮
   */
  menus?: CollectionMenuItem[]
  /**
   自定义渲染收藏 item
   */
  renderItem?: (options: {
    collection: V2NIMCollection
    msg: V2NIMMessage
  }) => JSX.Element | null | undefined
  /**
   自定义渲染 header
   */
  renderHeader?: () => JSX.Element | null | undefined
  /**
   自定义渲染空白占位图
   */
  renderEmpty?: () => JSX.Element | null | undefined
  prefix?: string
  commonPrefix?: string
}

const CollectionList: React.FC<CollectionListProps> = ({
  menus,
  renderItem,
  renderEmpty,
  renderHeader,
  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const { t } = useTranslation()
  const { nim } = useStateContext()

  const _prefix = `${prefix}-collection-list`

  const [list, setList] = useState<V2NIMCollection[]>([])
  const [forwardMessage, setForwardMessage] = useState<
    V2NIMMessageForUI | undefined
  >(undefined)
  const [noMore, setNoMore] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const getCollectionList = async (options: V2NIMCollectionOption) => {
    try {
      const data = await nim.V2NIMMessageService.getCollectionListByOption(
        options
      )

      logger.log('getCollectionList success: ', data, options)
      const newData = [...data, ...list]

      setList(newData)
      setNoMore(data.length < LIMIT ? true : false)
    } catch (error) {
      message.error(t('getCollectionFailed'))
      logger.error(
        'getCollectionList failed: ',
        (error as V2NIMError).toString()
      )
    }
  }

  useEffect(() => {
    getCollectionList({
      limit: LIMIT,
      collectionType: 0,
    })
  }, [])

  const onMenuClick = ({
    key,
    collection,
    msg,
  }: {
    key: string
    collection: V2NIMCollection
    msg: V2NIMMessage
  }) => {
    const menu = menus?.find((item) => item.key === key)

    if (menu?.onClick) {
      return menu?.onClick({
        collection,
        msg,
      })
    }

    switch (key) {
      case 'forward':
        setForwardMessage(msg)
        break
      case 'delete':
        Modal.confirm({
          title: t('confirmRemoveCollection'),
          onOk: async () => {
            try {
              await nim.V2NIMMessageService.removeCollections([collection])
              const newData = list.filter(
                (item) => item.uniqueId !== collection.uniqueId
              )

              setList(newData)
              message.success(t('removeCollectionSuccess'))
            } catch (error) {
              message.error(t('removeCollectionFailed'))
              logger.error(
                'removeCollections failed: ',
                (error as V2NIMError).toString()
              )
            }
          },
        })
        break
      default:
        break
    }
  }

  const onScroll = debounce(() => {
    if (containerRef.current) {
      if (
        // 滚动到最底部了
        containerRef.current.scrollTop >=
        containerRef.current.scrollHeight -
          containerRef.current.clientHeight -
          70
      ) {
        const current = list[0]

        if (current && !noMore) {
          getCollectionList({
            limit: LIMIT,
            collectionType: 0,
            beginTime: current.updateTime,
            anchorCollection: current,
          })
        }
      }
    }
  }, 300)

  const handleForwardModalSend = () => {
    setForwardMessage(undefined)
    message.success(t('forwardSuccessText'))
  }

  const handleForwardModalClose = () => {
    setForwardMessage(undefined)
  }

  return (
    <div className={`${_prefix}-wrap`}>
      {renderHeader?.() ?? (
        <div className={`${_prefix}-header`}>{t('collection')}</div>
      )}
      <div
        className={`${_prefix}-container`}
        onScroll={onScroll}
        ref={containerRef}
      >
        {list.length ? (
          <>
            {list.map((item) => (
              <CollectionItem
                key={item.uniqueId}
                collection={item}
                onMenuClick={onMenuClick}
                renderItem={renderItem}
                prefix={prefix}
                commonPrefix={commonPrefix}
              />
            ))}
            {noMore && (
              <div className={`${_prefix}-nomore`}>
                {t('noMoreCollectionText')}
              </div>
            )}
          </>
        ) : (
          renderEmpty?.() ?? <Empty style={{ marginTop: 10 }} />
        )}
      </div>
      <ChatForwardModal
        visible={!!forwardMessage}
        msg={forwardMessage}
        onSend={handleForwardModalSend}
        onCancel={handleForwardModalClose}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    </div>
  )
}

export default CollectionList
