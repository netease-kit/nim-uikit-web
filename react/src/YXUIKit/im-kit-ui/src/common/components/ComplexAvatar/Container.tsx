import React, { FC, useState, useEffect } from 'react'
import { ComplexAvatarUI, ComplexAvatarProps } from './ComplexAvatarUI'
import { message, Modal } from 'antd'
import { useStateContext } from '../../hooks/useStateContext'
import { useTranslation } from '../../hooks/useTranslation'
import { observer } from 'mobx-react'

export type ComplexAvatarContainerProps = Pick<
  ComplexAvatarProps,
  'count' | 'dot' | 'size' | 'icon' | 'account'
> & {
  canClick?: boolean

  onCancel?: () => void
  afterAddFriend?: (account: string) => void
  afterDeleteFriend?: (account: string) => void
  afterBlockFriend?: (account: string) => void
  afterRemoveBlockFriend?: (account: string) => void
  afterSendMsgClick?: () => void

  prefix?: string
}

export const ComplexAvatarContainer: FC<ComplexAvatarContainerProps> = observer(
  ({
    canClick = true,
    account,
    prefix = 'common',
    count,
    dot,
    size,
    icon,
    onCancel,
    afterAddFriend,
    afterDeleteFriend,
    afterBlockFriend,
    afterRemoveBlockFriend,
    afterSendMsgClick,
  }) => {
    const { store, localOptions } = useStateContext()

    const { t } = useTranslation()

    const [visible, setVisible] = useState(false)
    // const [relation, setRelation] = useState<Relation>('stranger')
    const relation = store.uiStore.getRelationByAccount(account)

    const userInfo = store.uiStore.getFriendWithUserNameCard(account)

    useEffect(() => {
      store.userStore.getUserActive(account)
    }, [store.userStore, account])

    useEffect(() => {
      if (visible) {
        // 从服务端更新下个人信息
        store.userStore.getUserForceActive(account)
      }
    }, [store.uiStore, store.userStore, account, visible])

    const handleCancel = () => {
      setVisible(false)
      onCancel?.()
    }

    const handleOnAddFriendClick = async () => {
      try {
        if (localOptions.addFriendNeedVerify) {
          await store.friendStore.applyFriendActive(account)
          message.success(t('applyFriendSuccessText'))
        } else {
          await store.friendStore.addFriendActive(account)
          message.success(t('addFriendSuccessText'))
        }
        setVisible(false)
        afterAddFriend?.(account)
      } catch (error) {
        if (localOptions.addFriendNeedVerify) {
          message.error(t('applyFriendFailedText'))
        } else {
          message.error(t('addFriendFailedText'))
        }
      }
    }

    const handleOnDeleteFriendClick = () => {
      Modal.confirm({
        title: t('deleteFriendText'),
        content: t('confirmDeleteFriendText'),
        okText: t('okText'),
        cancelText: t('cancelText'),
        onOk: async () => {
          try {
            await store.friendStore.deleteFriendActive(account)
            message.success(t('deleteFriendSuccessText'))
            setVisible(false)
            afterDeleteFriend?.(account)
          } catch (error) {
            message.error(t('deleteFriendFailedText'))
          }
        },
      })
    }

    const handleOnBlockFriendClick = async () => {
      try {
        await store.relationStore.setBlackActive({
          account,
          isAdd: true,
        })
        message.success(t('blackSuccessText'))
        setVisible(false)
        afterBlockFriend?.(account)
      } catch (error) {
        message.error(t('blackFailedText'))
      }
    }

    const handleOnRemoveBlockFriendClick = async () => {
      try {
        await store.relationStore.setBlackActive({
          account,
          isAdd: false,
        })
        message.success(t('removeBlackSuccessText'))
        setVisible(false)
        afterRemoveBlockFriend?.(account)
      } catch (error) {
        message.error(t('removeBlackFailedText'))
      }
    }

    const handleOnSendMsgClick = async () => {
      setVisible(false)
      await store.sessionStore.insertSessionActive('p2p', account)
      afterSendMsgClick?.()
    }

    const handleOnAvatarClick = () => {
      setVisible(true)
    }

    const handleChangeAlias = async (alias: string) => {
      try {
        if (userInfo.account) {
          await store.friendStore.updateFriendActive(userInfo.account, alias)
          message.success(t('updateAliasSuccessText'))
        }
      } catch (error) {
        message.error(t('updateAliasFailedText'))
      }
    }

    return (
      <ComplexAvatarUI
        relation={relation}
        visible={visible}
        onCancel={handleCancel}
        onChangeAlias={handleChangeAlias}
        onAddFriendClick={handleOnAddFriendClick}
        onDeleteFriendClick={handleOnDeleteFriendClick}
        onBlockFriendClick={handleOnBlockFriendClick}
        onRemoveBlockFriendClick={handleOnRemoveBlockFriendClick}
        onSendMsglick={handleOnSendMsgClick}
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
