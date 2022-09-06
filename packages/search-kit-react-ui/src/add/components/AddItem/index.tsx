import React from 'react'
import { CommonIcon } from '@xkit-yx/common-ui'
import { PanelScene } from '../../Container'

export interface AddItemProps {
  scene: PanelScene
  icon: string
  content: string
  onClick: (scene: PanelScene) => void
  prefix: string
}

const AddItem: React.FC<AddItemProps> = ({
  scene,
  icon,
  content,
  onClick,
  prefix,
}) => {
  const _prefix = `${prefix}-add-item`
  return (
    <div className={_prefix} onClick={() => onClick(scene)}>
      <CommonIcon className={`${_prefix}-icon`} type={icon} />
      <div className={`${_prefix}-content`}>{content}</div>
    </div>
  )
}
export default AddItem
