import React, { FC, ReactNode } from 'react'
import { Avatar, Badge } from 'antd'
import { ContactType } from '@xkit-yx/im-store'

export interface ContactItemProps {
  icon: ReactNode
  label: string
  contactType: ContactType
  isSelectd?: boolean
  backgroundColor: string
  onItemClick: (contactType: ContactType) => void
  prefix?: string
  unread?: number
}

export const ContactItem: FC<ContactItemProps> = ({
  icon,
  label,
  contactType,
  isSelectd = false,
  backgroundColor,
  onItemClick,
  prefix = 'contact',
  unread = 0,
}) => {
  const _prefix = `${prefix}-list-item`

  return (
    <div
      className={`${_prefix} ${isSelectd ? `${_prefix}-select` : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onItemClick(contactType)
      }}
    >
      <Badge count={unread}>
        <Avatar
          size={36}
          icon={icon}
          style={{ backgroundColor, color: '#fff' }}
        />
      </Badge>
      <span className={`${_prefix}-label`}>{label}</span>
    </div>
  )
}
