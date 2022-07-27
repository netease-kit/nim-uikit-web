import React from 'react'
import { CommonIcon } from '@xkit-yx/common-ui'

export interface AddItemProps {
  id: number
  icon: string
  content: string
  onClick: (id: number) => void
  prefix: string
}

const AddItem: React.FC<AddItemProps> = ({
  id,
  icon,
  content,
  onClick,
  prefix,
}) => {
  const _prefix = `${prefix}-add-item`
  return (
    <div className={_prefix} onClick={() => onClick(id)}>
      <CommonIcon className={`${_prefix}-icon`} type={icon} />
      <div className={`${_prefix}-content`}>{content}</div>
    </div>
  )
}
export default AddItem
