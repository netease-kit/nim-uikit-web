import React, { FC } from 'react'
import { UserOutlined, TeamOutlined, RobotOutlined } from '@ant-design/icons'
import { ContactItemProps, ContactItem } from './ContactItem'
import { CommonIcon, useStateContext, useTranslation } from '../../../common'
import { ContactType } from '@xkit-yx/im-store-v2'
import { observer } from 'mobx-react'

export interface ContactListProps {
  selectedContactType: ContactType | ''
  onItemClick: (contactType: ContactType) => void
  renderCustomContact?: (
    contactType: ContactType
  ) => JSX.Element | null | undefined
  systemMsgUnread: number
  prefix?: string
}

export const ContactList: FC<ContactListProps> = observer(
  ({
    selectedContactType,
    onItemClick,
    renderCustomContact,
    systemMsgUnread,
    prefix = 'contact',
  }) => {
    const _prefix = `${prefix}-list`

    const { t } = useTranslation()

    const { localOptions } = useStateContext()

    const dataSource: ContactItemProps[] = [
      {
        contactType: 'msgList',
        label: t('msgMenuText'),
        show: true,
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
        show: true,
        icon: <UserOutlined />,
        backgroundColor: '#53C3F3',
        onItemClick: (contactType) => {
          onItemClick(contactType)
        },
      },
      {
        contactType: 'friendList',
        label: t('friendMenuText'),
        show: true,
        icon: <UserOutlined />,
        backgroundColor: '#537FF4',
        onItemClick: (contactType) => {
          onItemClick(contactType)
        },
      },
      {
        contactType: 'groupList',
        label: t('teamMenuText'),
        show: true,
        icon: <TeamOutlined />,
        backgroundColor: '#BE65D9',
        onItemClick: (contactType) => {
          onItemClick(contactType)
        },
      },
      {
        contactType: 'aiList',
        label: t('aiMenuText'),
        show: !!localOptions.aiVisible,
        icon: <CommonIcon type="icon-a-zu281" size={18} />,
        backgroundColor: '#854FE2',
        onItemClick: (contactType) => {
          onItemClick(contactType)
        },
      },
    ]

    return (
      <div className={`${_prefix}-wrapper`}>
        {dataSource
          .filter((item) => item.show)
          .map((item) => {
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
)
