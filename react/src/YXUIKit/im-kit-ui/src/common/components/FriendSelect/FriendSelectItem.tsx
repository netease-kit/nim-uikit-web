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
}

export const FriendSelectItem: FC<FriendSelectItemProps> = ({
  isSelected = false,
  onSelect,
  canSelect = true,
  prefix = 'common',
  account,
  appellation,
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
          className={`${_prefix}-checkbox`}
        />
      ) : null}
      <ComplexAvatarContainer size={32} account={account} canClick={false} />
      <span className={`${_prefix}-label`}>{appellation}</span>
    </div>
  )
}
