import React, { FC } from 'react'
import { UserOutlined, TeamOutlined } from '@ant-design/icons'
import { ContactItemProps, ContactItem } from './ContactItem'
import { ContextManagerTypes, useTranslation } from '@xkit-yx/common-ui'

export interface ContactListProps {
  selectedContactType: ContextManagerTypes.ContactType | ''
  onItemClick: (contactType: ContextManagerTypes.ContactType) => void
  renderCustomContact?: (
    contactType: ContextManagerTypes.ContactType
  ) => JSX.Element
  prefix?: string
}

export const ContactList: FC<ContactListProps> = ({
  selectedContactType,
  onItemClick,
  renderCustomContact,
  prefix = 'contact',
}) => {
  const _prefix = `${prefix}-list`

  const { t } = useTranslation()

  const dataSource: ContactItemProps[] = [
    {
      contactType: 'blackList',
      label: t('blackMenuText'),
      icon: <UserOutlined />,
      backgroundColor: '#53C3F3',
      onItemClick: (contactType) => {
        onItemClick(contactType)
      },
    },
    {
      contactType: 'friendList',
      label: t('friendMenuText'),
      icon: <UserOutlined />,
      backgroundColor: '#537FF4',
      onItemClick: (contactType) => {
        onItemClick(contactType)
      },
    },
    {
      contactType: 'groupList',
      label: t('teamMenuText'),
      icon: <TeamOutlined />,
      backgroundColor: '#BE65D9',
      onItemClick: (contactType) => {
        onItemClick(contactType)
      },
    },
  ]

  return (
    <div className={`${_prefix}-wrapper`}>
      {dataSource.map((item) => (
        <ContactItem
          key={item.contactType}
          prefix={prefix}
          isSelectd={item.contactType === selectedContactType}
          renderCustomContact={renderCustomContact}
          {...item}
        />
      ))}
    </div>
  )
}
