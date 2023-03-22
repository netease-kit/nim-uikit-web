import React, { FC } from 'react'
import { ContactList } from './components/ContactList'
import { logger } from '../../utils'
import { useEventTracking, useStateContext } from '../../common'
import { ContactType } from '@xkit-yx/im-store'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'

export interface ContactListContainerProps {
  /**
   样式前缀
   */
  prefix?: string
  /**
   通讯录导航点击事件
   */
  onItemClick?: (contactType: ContactType) => void
  /**
   自定义渲染通讯录导航
   */
  renderCustomContact?: (
    contactType: ContactType
  ) => JSX.Element | null | undefined
}

export const ContactListContainer: FC<ContactListContainerProps> = observer(
  ({ prefix = 'contact', onItemClick, renderCustomContact }) => {
    const { nim, store, initOptions } = useStateContext()

    useEventTracking({
      appkey: initOptions.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: nim.version,
    })

    const handleItemClick = (contactType: ContactType) => {
      logger.log('选中通讯录导航：', contactType)
      store.uiStore.selectContactType(contactType)
      if (contactType === 'msgList') {
        store.sysMsgStore.resetSystemMsgUnread()
      }
      onItemClick?.(contactType)
    }

    return (
      <ContactList
        selectedContactType={store.uiStore.selectedContactType}
        onItemClick={handleItemClick}
        renderCustomContact={renderCustomContact}
        systemMsgUnread={store.uiStore.systemMsgUnread}
        prefix={prefix}
      />
    )
  }
)
