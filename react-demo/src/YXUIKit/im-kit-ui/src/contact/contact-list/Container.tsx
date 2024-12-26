import React, { FC } from 'react'
import { ContactList } from './components/ContactList'
import { logger } from '../../utils'
import { useEventTracking, useStateContext } from '../../common'
import { ContactType } from '@xkit-yx/im-store-v2'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'
import sdkPkg from 'nim-web-sdk-ng/package.json'

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
    const { nim, store } = useStateContext()

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: sdkPkg.version,
    })

    const handleItemClick = (contactType: ContactType) => {
      logger.log('选中通讯录导航：', contactType)
      store.uiStore.selectContactType(contactType)
      if (contactType === 'msgList') {
        store.sysMsgStore.setAllApplyMsgRead()
      }

      onItemClick?.(contactType)
    }

    return (
      <ContactList
        selectedContactType={store.uiStore.selectedContactType}
        onItemClick={handleItemClick}
        renderCustomContact={renderCustomContact}
        systemMsgUnread={store.sysMsgStore.getTotalUnreadMsgsCount()}
        prefix={prefix}
      />
    )
  }
)
