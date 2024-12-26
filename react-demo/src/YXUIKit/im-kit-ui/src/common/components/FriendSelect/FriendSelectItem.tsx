import React, { FC } from 'react'
import { Checkbox } from 'antd'
import { ComplexAvatarContainer } from '../ComplexAvatar'

export interface FriendSelectItemProps {
  isSelected?: boolean
  onSelect?: (account: string, selected: boolean) => void
  canSelect?: boolean
  prefix?: string
  account: string
  appellation: string
  disabled?: boolean
}

export const FriendSelectItem: FC<FriendSelectItemProps> = ({
  isSelected = false,
  onSelect,
  canSelect = true,
  prefix = 'common',
  account,
  appellation,
  disabled = false,
}) => {
  const _prefix = `${prefix}-friend-select-item`

  return (
    <div className={_prefix}>
      {canSelect ? (
        <Checkbox
          checked={isSelected}
          onChange={(e) => {
            onSelect?.(account, e.target.checked)
          }}
          disabled={disabled}
          className={`${_prefix}-checkbox`}
        />
      ) : null}
      <ComplexAvatarContainer size={32} account={account} canClick={false} />
      <span className={`${_prefix}-label`}>{appellation}</span>
    </div>
  )
}
