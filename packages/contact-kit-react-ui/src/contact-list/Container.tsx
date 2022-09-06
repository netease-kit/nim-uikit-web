import React, { FC } from 'react'
import { ContactList } from './components/ContactList'
import { logger } from '../logger'
import {
  ContextManagerTypes,
  useEventTracking,
  useStateContext,
} from '@xkit-yx/common-ui'
import packageJson from '../../package.json'
import { observer } from 'mobx-react'

export interface ContactListContainerProps {
  /**
   样式前缀
   */
  prefix?: string
  /**
   自定义渲染通讯录内容
   */
  renderCustomContact?: (
    contactType: ContextManagerTypes.ContactType
  ) => JSX.Element
}

export const ContactListContainer: FC<ContactListContainerProps> = observer(
  ({ prefix = 'contact', renderCustomContact }) => {
    const { nim, store, initOptions } = useStateContext()

    useEventTracking({
      appkey: initOptions.appkey,
      version: packageJson.version,
      component: 'contact-kit',
      imVersion: nim.version,
    })

    const handleItemClick = (contactType: ContextManagerTypes.ContactType) => {
      logger.log('选中通讯录：', contactType)
      store.uiStore.selectContactType(contactType)
    }

    return (
      <ContactList
        selectedContactType={store.uiStore.selectedContactType}
        onItemClick={handleItemClick}
        renderCustomContact={renderCustomContact}
        prefix={prefix}
      />
    )
  }
)
