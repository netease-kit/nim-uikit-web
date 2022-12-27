import React, { FC } from 'react'
import { ContactList } from './components/ContactList'
import { logger } from '../logger'
import {
  ContextManagerTypes,
  useEventTracking,
  useStateContext,
} from '../../../common-ui/src'
import packageJson from '../../package.json'
import { observer } from 'mobx-react'

export interface ContactListContainerProps {
  /**
   样式前缀
   */
  prefix?: string
  /**
   通讯录导航点击事件
   */
  onItemClick?: (contactType: ContextManagerTypes.ContactType) => void
  /**
   自定义渲染通讯录导航
   */
  renderCustomContact?: (
    contactType: ContextManagerTypes.ContactType
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

    const handleItemClick = (contactType: ContextManagerTypes.ContactType) => {
      logger.log('选中通讯录导航：', contactType)
      store.uiStore.selectContactType(contactType)
      if (contactType === 'msgList') {
        store.uiStore.resetSystemMsgUnread()
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
