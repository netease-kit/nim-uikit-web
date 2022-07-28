import React, { FC } from 'react'
import { Checkbox } from 'antd'
import { CrudeAvatar } from '../CrudeAvatar'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

export interface FriendSelectItemProps extends NimKitCoreTypes.IFriendInfo {
  isSelected?: boolean
  onSelect?: (account: string, selected: boolean) => void
  canSelect: boolean
  prefix?: string
}

export const FriendSelectItem: FC<FriendSelectItemProps> = ({
  isSelected = false,
  onSelect,
  canSelect = true,
  prefix = 'common',
  ...props
}) => {
  const _prefix = `${prefix}-friend-select-item`

  return (
    <div className={_prefix}>
      {canSelect ? (
        <Checkbox
          checked={isSelected}
          onChange={(e) => {
            onSelect?.(props.account, e.target.checked)
          }}
          className={`${_prefix}-checkbox`}
        />
      ) : null}
      <CrudeAvatar size={32} {...props} />
      <span className={`${_prefix}-label`}>
        {props.nick || props.account || ''}
      </span>
    </div>
  )
}
