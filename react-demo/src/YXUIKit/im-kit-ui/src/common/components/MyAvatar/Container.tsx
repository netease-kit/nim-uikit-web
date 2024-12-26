import React, { FC, useState } from 'react'
import {
  ComplexAvatarUI,
  ComplexAvatarProps,
} from '../ComplexAvatar/ComplexAvatarUI'
import { message } from 'antd'
import { useStateContext } from '../../hooks/useStateContext'
import { useTranslation } from '../../hooks/useTranslation'
import { observer } from 'mobx-react'
import { V2NIMUserUpdateParams } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService'
import { Gender } from '../UserCard'

export type MyAvatarContainerProps = Pick<
  ComplexAvatarProps,
  'count' | 'dot' | 'size' | 'icon'
> & {
  canClick?: boolean

  onCancel?: () => void
  afterSave?: (res: V2NIMUserUpdateParams) => void

  prefix?: string
}

export const MyAvatarContainer: FC<MyAvatarContainerProps> = observer(
  ({
    canClick = true,
    prefix = 'common',
    count,
    dot,
    size,
    icon,
    onCancel,
    afterSave,
  }) => {
    const { store } = useStateContext()

    const { t } = useTranslation()

    const [visible, setVisible] = useState(false)

    const userInfo = store.userStore.myUserInfo

    const handleSave = ({
      avatarFile,
      gender,
      email,
      nick,
      tel,
      signature,
    }: {
      avatarFile?: File
      gender?: Gender
      email?: string
      nick?: string
      tel?: string
      signature?: string
    }) => {
      const params: V2NIMUserUpdateParams = {}

      if (gender !== void 0) {
        params.gender = gender
      }

      if (email !== void 0) {
        params.email = email
      }

      if (nick !== void 0) {
        params.name = nick
      }

      if (tel !== void 0) {
        params.mobile = tel
      }

      if (signature !== void 0) {
        params.sign = signature
      }

      store.userStore
        .updateSelfUserProfileActive(params, avatarFile)
        .then(() => {
          message.success(t('saveSuccessText'))
          setVisible(false)
          afterSave?.(params)
        })
        .catch(() => {
          message.error(t('saveFailedText'))
        })
    }

    const handleCancel = () => {
      setVisible(false)
      onCancel?.()
    }

    const handleOnAvatarClick = () => {
      setVisible(true)
    }

    return (
      <ComplexAvatarUI
        relation="myself"
        visible={visible}
        isInBlacklist={false}
        onCancel={handleCancel}
        onSave={handleSave}
        onAvatarClick={canClick ? handleOnAvatarClick : undefined}
        prefix={prefix}
        count={count}
        dot={dot}
        size={size}
        icon={icon}
        account={userInfo.accountId}
        gender={userInfo.gender as Gender}
        nick={userInfo.name}
        tel={userInfo.mobile}
        signature={userInfo.sign}
        birth={userInfo.birthday}
        ext={userInfo.serverExtension}
        {...userInfo}
      />
    )
  }
)
