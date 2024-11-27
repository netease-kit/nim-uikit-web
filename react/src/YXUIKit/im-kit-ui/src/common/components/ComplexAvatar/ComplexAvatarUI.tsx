import React, { FC } from 'react'
import { UserCard, UserCardProps } from '../UserCard'
import { MyUserCard, MyUserCardProps } from '../MyUserCard'
import { CrudeAvatar, CrudeAvatarProps } from '../CrudeAvatar'

export type ComplexAvatarProps = Omit<UserCardProps, 'relation' | 'onCancel'> &
  Omit<MyUserCardProps, 'onSave' | 'onCancel'> &
  CrudeAvatarProps & {
    relation: UserCardProps['relation'] | 'myself'
    onChangeAlias?: (alias: string) => void
    onAvatarClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    onCancel?: () => void
    onSave?: MyUserCardProps['onSave']
  }

export const ComplexAvatarUI: FC<ComplexAvatarProps> = ({
  relation,
  visible,
  prefix = 'common',
  onChangeAlias,
  onAvatarClick,
  onCancel,
  onSave,
  onAddFriendClick,
  onDeleteFriendClick,
  onBlockFriendClick,
  onRemoveBlockFriendClick,
  onSendMsglick,
  ...props
}) => {
  const _prefix = `${prefix}-complex-avatar`

  return (
    <div
      className={`${_prefix}-wrapper ${
        !onAvatarClick ? `${_prefix}-wrapper-nocursor` : ''
      }`}
      onClick={(e) => {
        if (onAvatarClick) {
          e.stopPropagation()
        }
      }}
    >
      <div onClick={onAvatarClick}>
        <CrudeAvatar {...props} />
      </div>
      {relation === 'myself' ? (
        <MyUserCard
          visible={visible}
          onSave={onSave}
          onCancel={onCancel}
          prefix={prefix}
          {...props}
        />
      ) : (
        <UserCard
          visible={visible}
          relation={relation}
          onCancel={onCancel}
          onChangeAlias={onChangeAlias}
          onAddFriendClick={onAddFriendClick}
          onDeleteFriendClick={onDeleteFriendClick}
          onBlockFriendClick={onBlockFriendClick}
          onRemoveBlockFriendClick={onRemoveBlockFriendClick}
          onSendMsglick={onSendMsglick}
          prefix={prefix}
          {...props}
        />
      )}
    </div>
  )
}
