import React, { FC } from 'react'
import { UserOutlined, TeamOutlined } from '@ant-design/icons'
import { ContactItemProps, ContactItem } from './ContactItem'
import { useTranslation } from '../../../common'
import { ContactType } from '@xkit-yx/im-store-v2'

export interface ContactListProps {
  selectedContactType: ContactType | ''
  onItemClick: (contactType: ContactType) => void
  renderCustomContact?: (
    contactType: ContactType
  ) => JSX.Element | null | undefined
  systemMsgUnread: number
  prefix?: string
}

export const ContactList: FC<ContactListProps> = ({
  selectedContactType,
  onItemClick,
  renderCustomContact,
  systemMsgUnread,
  prefix = 'contact',
}) => {
  const _prefix = `${prefix}-list`

  const { t } = useTranslation()

  const dataSource: ContactItemProps[] = [
    {
      contactType: 'msgList',
      label: t('msgMenuText'),
      icon: <TeamOutlined />,
      backgroundColor: '#60CFA7',
      onItemClick: (contactType) => {
        onItemClick(contactType)
      },
      unread: systemMsgUnread,
    },
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
      {dataSource.map((item) => {
        return (
          renderCustomContact?.(item.contactType) ?? (
            <ContactItem
              key={item.contactType}
              prefix={prefix}
              isSelectd={item.contactType === selectedContactType}
              {...item}
            />
          )
        )
      })}
    </div>
  )
}
