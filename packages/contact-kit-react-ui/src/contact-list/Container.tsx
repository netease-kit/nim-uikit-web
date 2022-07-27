import React, { FC, useContext, useEffect, useMemo, useCallback } from 'react'
import { ContactList } from './components/ContactList'
import { logger } from '../logger'
import {
  Context,
  ContextManagerTypes,
  useEventTracking,
} from '@xkit-yx/common-ui'
import packageJson from '../../package.json'

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

export const ContactListContainer: FC<ContactListContainerProps> = ({
  prefix = 'contact',
  renderCustomContact,
}) => {
  // 在这里汇聚所有需要用到的 Context，并完成数据的操作传递给纯渲染组件
  const { nim, state, dispatch, initOptions } = useContext(Context)

  // 这里需要对用到的 Context 中的值判空并做好提示
  if (!nim || !state || !dispatch || !initOptions) {
    throw new Error('Please use Provider to wrap ContactListContainer.')
  }

  useEventTracking({
    appkey: initOptions.appkey,
    version: packageJson.version,
    component: 'contact-kit',
    imVersion: nim.version,
  })

  const handleItemClick = useCallback(
    (contactType: ContextManagerTypes.ContactType) => {
      logger.log('选中通讯录：', contactType)
      dispatch({
        type: 'selectContactType',
        payload: contactType,
      })
    },
    [dispatch]
  )

  const contactListRenderer = useMemo(() => {
    return (
      <ContactList
        selectedContactType={state.selectedContactType}
        onItemClick={handleItemClick}
        renderCustomContact={renderCustomContact}
        prefix={prefix}
      />
    )
  }, [state.selectedContactType, prefix, handleItemClick, renderCustomContact])

  return contactListRenderer
}
