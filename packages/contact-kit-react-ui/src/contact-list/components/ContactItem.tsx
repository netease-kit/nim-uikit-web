import React, { FC, ReactNode } from 'react'
import { Avatar } from 'antd'
import { ContextManagerTypes } from '@xkit-yx/common-ui'

export interface ContactItemProps {
  icon: ReactNode
  label: string
  contactType: ContextManagerTypes.ContactType
  isSelectd?: boolean
  backgroundColor: string
  onItemClick: (contactType: ContextManagerTypes.ContactType) => void
  renderCustomContact?: (
    contactType: ContextManagerTypes.ContactType
  ) => JSX.Element
  prefix?: string
}

export const ContactItem: FC<ContactItemProps> = ({
  icon,
  label,
  contactType,
  isSelectd = false,
  backgroundColor,
  onItemClick,
  renderCustomContact,
  prefix = 'contact',
}) => {
  const _prefix = `${prefix}-list-item`

  return (
    <div
      className={`${_prefix} ${isSelectd ? `${_prefix}-select` : null}`}
      onClick={(e) => {
        e.stopPropagation()
        onItemClick(contactType)
      }}
    >
      {renderCustomContact ? (
        renderCustomContact(contactType)
      ) : (
        <>
          <Avatar
            size={36}
            icon={icon}
            style={{ backgroundColor, color: '#fff' }}
          />
          <span className={`${_prefix}-label`}>{label}</span>
        </>
      )}
    </div>
  )
}
