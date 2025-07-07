import React, { useMemo } from 'react'
import {
  CommonIcon,
  ParseSession,
  useStateContext,
  useTranslation,
} from '../../../common'
import {
  V2NIMCollection,
  V2NIMMessage,
} from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'
import { Dropdown, Menu } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { formatDate, mergeActions } from '../../../utils'
import { MenuItem } from '../ChatMessageItem'
import { CollectionMenuItem } from '.'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

export interface CollectionItemProps {
  collection: V2NIMCollection
  menus?: CollectionMenuItem[]
  onMenuClick: (options: {
    key: string
    collection: V2NIMCollection
    msg: V2NIMMessage
  }) => void
  renderItem?: (options: {
    collection: V2NIMCollection
    msg: V2NIMMessage
  }) => JSX.Element | null | undefined

  prefix?: string
  commonPrefix?: string
}

const CollectionItem: React.FC<CollectionItemProps> = ({
  collection,
  menus,
  onMenuClick,
  renderItem,
  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const { t } = useTranslation()
  const { nim } = useStateContext()

  const collectionData = useMemo(() => {
    let data

    try {
      data = JSON.parse(collection.collectionData || '{}')
    } catch (error) {
      console.log('collection.collectionData', error)
    }

    return data
  }, [collection.collectionData])

  const msg = useMemo(() => {
    return nim.V2NIMMessageConverter.messageDeserialization(
      collectionData?.message
    ) as V2NIMMessage
  }, [collectionData, nim.V2NIMMessageConverter])

  const _prefix = `${prefix}-collection-item`

  const menuItems = useMemo(() => {
    const defaultMenus: MenuItem[] = [
      {
        show:
          msg?.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO
            ? 0
            : 1,
        key: 'forward',
        label: t('forwardText'),
        icon: <CommonIcon type="icon-zhuanfa" />,
      },
      {
        show: 1,
        label: t('deleteText'),
        key: 'delete',
        icon: <DeleteOutlined />,
      },
    ]

    const finalMenus = menus
      ? mergeActions(defaultMenus, menus, 'key')
      : defaultMenus

    return finalMenus.filter((item) => item.show)
  }, [menus, t, msg?.messageType])

  const handleMenuClick = ({ key }: { key: string }) => {
    onMenuClick({
      key,
      collection,
      msg,
    })
  }

  return (
    renderItem?.({ msg, collection }) ?? (
      <div className={`${_prefix}-wrap`}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div className={`${_prefix}-content`}>
            <div className={`${_prefix}-content-top`}>
              <div className={`${_prefix}-content-top-msg`}>
                {msg && <ParseSession msg={msg} prefix={commonPrefix} />}
              </div>
              <div className={`${_prefix}-content-top-icon`}>
                <Dropdown
                  trigger={['click']}
                  overlay={<Menu onClick={handleMenuClick} items={menuItems} />}
                  getPopupContainer={(triggerNode) => triggerNode}
                  overlayClassName={`${_prefix}-dropdown`}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                    }}
                  >
                    ...
                  </div>
                </Dropdown>
              </div>
            </div>
            <div className={`${_prefix}-info`}>
              <span>{collectionData?.senderName}</span>
              <span>
                {formatDate(collection.updateTime || collection.createTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  )
}

export default CollectionItem
