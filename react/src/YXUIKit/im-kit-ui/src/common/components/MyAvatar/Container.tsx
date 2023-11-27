import React, { FC, useState } from 'react'
import {
  ComplexAvatarUI,
  ComplexAvatarProps,
} from '../ComplexAvatar/ComplexAvatarUI'
import { message } from 'antd'
import { useStateContext } from '../../hooks/useStateContext'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { useTranslation } from '../../hooks/useTranslation'
import { observer } from 'mobx-react'

export type MyAvatarContainerProps = Pick<
  ComplexAvatarProps,
  'count' | 'dot' | 'size' | 'icon'
> & {
  canClick?: boolean

  onCancel?: () => void
  afterSave?: (res: UserNameCard) => void

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

    const handleSave = (
      params: Pick<
        UserNameCard,
        'email' | 'gender' | 'nick' | 'tel' | 'signature'
      > & { avatarFile?: File }
    ) => {
      store.userStore
        .saveMyUserInfoActive({
          ...params,
          file: params.avatarFile,
          type: params.avatarFile ? 'image' : undefined,
        })
        .then((res) => {
          message.success(t('saveSuccessText'))
          setVisible(false)
          afterSave?.(res)
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
        {...userInfo}
      />
    )
  }
)
