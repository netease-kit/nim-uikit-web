import React, { FC, useState, useEffect } from 'react'
import { ComplexAvatarUI, ComplexAvatarProps } from './ComplexAvatarUI'
import { message, Modal } from 'antd'
import { useStateContext } from '../../hooks/useStateContext'
import { useTranslation } from '../../hooks/useTranslation'
import { observer } from 'mobx-react'
import { Gender } from '../UserCard'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

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

    const { relation, isInBlacklist } = store.uiStore.getRelation(account)

    const userInfo =
      relation === 'ai'
        ? store.aiUserStore.aiUsers.get(account)
        : store.uiStore.getFriendWithUserNameCard(account)

    useEffect(() => {
      if (relation !== 'ai') {
        store.userStore.getUserActive(account)
      }
    }, [store.userStore, account, relation])

    useEffect(() => {
      if (visible && relation !== 'ai') {
        // 从服务端更新下个人信息
        store.userStore.getUserForceActive(account)
      }
    }, [store.uiStore, store.userStore, account, visible, relation])

    const handleCancel = () => {
      setVisible(false)
      onCancel?.()
    }

    const handleOnAddFriendClick = async () => {
      try {
        if (localOptions.addFriendNeedVerify) {
          await store.friendStore.addFriendActive(account, {
            addMode: V2NIMConst.V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_APPLY,
            postscript: '',
          })
          message.success(t('applyFriendSuccessText'))
        } else {
          await store.friendStore.addFriendActive(account, {
            addMode: V2NIMConst.V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_ADD,
            postscript: '',
          })
          message.success(t('addFriendSuccessText'))
        }

        // 发送申请或添加好友成功后解除黑名单
        await store.relationStore.removeUserFromBlockListActive(account)
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
        await store.relationStore.addUserToBlockListActive(account)
        message.success(t('blackSuccessText'))
        setVisible(false)
        afterBlockFriend?.(account)
      } catch (error) {
        message.error(t('blackFailedText'))
      }
    }

    const handleOnRemoveBlockFriendClick = async () => {
      try {
        await store.relationStore.removeUserFromBlockListActive(account)
        message.success(t('removeBlackSuccessText'))
        setVisible(false)
        afterRemoveBlockFriend?.(account)
      } catch (error) {
        message.error(t('removeBlackFailedText'))
      }
    }

    const handleOnSendMsgClick = async () => {
      setVisible(false)
      if (store.sdkOptions?.enableV2CloudConversation) {
        await store.conversationStore?.insertConversationActive(
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
          account
        )
      } else {
        await store.localConversationStore?.insertConversationActive(
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
          account
        )
      }

      afterSendMsgClick?.()
    }

    const handleOnAvatarClick = () => {
      setVisible(true)
    }

    const handleChangeAlias = async (alias: string) => {
      try {
        if (userInfo?.accountId) {
          await store.friendStore.setFriendInfoActive(userInfo.accountId, {
            alias,
          })
          message.success(t('updateAliasSuccessText'))
        }
      } catch (error) {
        message.error(t('updateAliasFailedText'))
      }
    }

    return (
      <ComplexAvatarUI
        relation={relation}
        isInBlacklist={isInBlacklist}
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
        account={userInfo?.accountId || ''}
        gender={userInfo?.gender as Gender}
        nick={userInfo?.name}
        tel={userInfo?.mobile}
        signature={userInfo?.sign}
        birth={userInfo?.birthday}
        ext={userInfo?.serverExtension}
        {...userInfo}
      />
    )
  }
)
