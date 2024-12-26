import React from 'react'
import AddItem, { AddItemProps } from '../AddItem'

export interface AddListProps {
  list: Omit<AddItemProps, 'prefix'>[]
  prefix: string
}

const AddList: React.FC<AddListProps> = ({ list, prefix }) => {
  const _prefix = `${prefix}-add-list`

  return (
    <div className={_prefix}>
      {list.map((item) => {
        return <AddItem {...item} prefix={prefix} key={item.scene} />
      })}
    </div>
  )
}

export default AddList
