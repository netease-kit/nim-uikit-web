import React, { FC, ReactNode } from 'react'
import { Avatar, Badge } from 'antd'
import { ContextManagerTypes } from '../../../../common-ui/src'

export interface ContactItemProps {
  icon: ReactNode
  label: string
  contactType: ContextManagerTypes.ContactType
  isSelectd?: boolean
  backgroundColor: string
  onItemClick: (contactType: ContextManagerTypes.ContactType) => void
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
