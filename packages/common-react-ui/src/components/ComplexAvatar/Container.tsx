import React, { FC, useState, useEffect, useContext, useCallback } from 'react'
import { ComplexAvatarUI, ComplexAvatarProps } from './ComplexAvatarUI'
import { message, Modal } from 'antd'
import { logger } from '../../utils'
import { Context } from '../../contextManager/Provider'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { useTranslation } from '../../hooks/useTranslation'
import { UserCardProps } from '../UserCard'

export type ComplexAvatarContainerProps = Omit<
  ComplexAvatarProps,
  | 'relation'
  | 'visible'
  | 'onSendMsglick'
  | 'onSave'
  | 'onAddFriendClick'
  | 'onDeleteFriendClick'
  | 'onBlockFriendClick'
  | 'onRemoveBlockFriendClick'
> & {
  afterSave?: (res: UserNameCard) => void
  afterAddFriend?: (account: string) => void
  afterDeleteFriend?: (account: string) => void
  afterBlockFriend?: (account: string) => void
  afterRemoveBlockFriend?: (account: string) => void
  afterSendMsgClick?: () => void
}

export const ComplexAvatarContainer: FC<ComplexAvatarContainerProps> = ({
  onCancel,
  afterSave,
  afterAddFriend,
  afterDeleteFriend,
  afterBlockFriend,
  afterRemoveBlockFriend,
  afterSendMsgClick,
  ...props
}) => {
  const { nim, state, dispatch, initOptions } = useContext(Context)

  if (!nim || !state || !dispatch || !initOptions) {
    throw new Error('Please use Provider to wrap ComplexAvatarContainer.')
  }

  const { t } = useTranslation()

  const [visible, setVisible] = useState(false)
  const [relation, setRelation] = useState<
    UserCardProps['relation'] | 'myself'
  >('stranger')

  useEffect(() => {
    if (visible) {
      Promise.all([nim.getFriends(), nim.getBlacks()])
        .then(([friendList, blackList]) => {
          logger.log('获取关系成功：', friendList, blackList)
          if (props.account === initOptions.account) {
            setRelation('myself')
          } else if (blackList.some((item) => item.account === props.account)) {
            setRelation('blacklist')
          } else if (
            friendList.some((item) => item.account === props.account)
          ) {
            setRelation('friend')
          } else {
            setRelation('stranger')
          }
        })
        .catch((err) => {
          logger.error('获取关系失败：', err)
        })
    }
  }, [nim, dispatch, initOptions.account, props.account, visible])

  const handleSave = (
    params: Pick<
      UserNameCard,
      'email' | 'gender' | 'nick' | 'tel' | 'signature'
    > & { avatarFile?: File }
  ) => {
    nim
      .saveMyUserInfo({
        ...params,
        file: params.avatarFile,
        type: params.avatarFile ? 'image' : undefined,
      })
      .then((res) => {
        message.success(t('saveSuccessText'))
        logger.log('保存资料成功：', res)
        setVisible(false)
        afterSave?.(res)
        dispatch({
          type: 'updateMyUserInfo',
          payload: res,
        })
      })
      .catch((err) => {
        message.error(t('saveFailedText'))
        logger.error('保存资料失败：', err)
      })
  }

  const handleCancel = () => {
    setVisible(false)
    onCancel?.()
  }

  const handleOnAddFriendClick = async () => {
    try {
      const res = await nim.addFriend({
        account: props.account,
      })
      const payload = await nim.getFriendInfos({ accounts: [props.account] })
      dispatch({
        type: 'updateFriends',
        payload,
      })
      dispatch({
        type: 'deleteBlacks',
        payload: [props.account],
      })
      message.success(t('addFriendSuccessText'))
      logger.log('添加好友成功：', res)
      setVisible(false)
      afterAddFriend?.(props.account)
    } catch (error) {
      message.error(t('addFriendFailedText'))
      logger.error('添加好友失败：', error)
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
          await nim.deleteFriend({
            account: props.account,
            delAlias: true,
          })
          dispatch({
            type: 'deleteFriends',
            payload: [props.account],
          })
          dispatch({
            type: 'deleteBlacks',
            payload: [props.account],
          })
          message.success(t('deleteFriendSuccessText'))
          logger.log('删除好友成功')
          setVisible(false)
          afterDeleteFriend?.(props.account)
        } catch (error) {
          message.error(t('deleteFriendFailedText'))
          logger.error('删除好友失败：', error)
        }
      },
    })
  }

  const handleOnBlockFriendClick = async () => {
    try {
      await nim.setBlack({
        account: props.account,
        isAdd: true,
      })
      const blacks = await nim.getBlackInfos({ accounts: [props.account] })
      const friends = await nim.getFriendInfos({ accounts: [props.account] })
      dispatch({
        type: 'updateBlacks',
        payload: blacks,
      })
      dispatch({
        type: 'updateFriends',
        payload: friends,
      })
      message.success(t('blackSuccessText'))
      logger.log('拉黑成功')
      setVisible(false)
      afterBlockFriend?.(props.account)
    } catch (error) {
      message.error(t('blackFailedText'))
      logger.error('拉黑失败：', error)
    }
  }

  const handleOnRemoveBlockFriendClick = async () => {
    try {
      await nim.setBlack({
        account: props.account,
        isAdd: false,
      })
      const friends = await nim.getFriendInfos({ accounts: [props.account] })
      dispatch({
        type: 'deleteBlacks',
        payload: [props.account],
      })
      dispatch({
        type: 'updateFriends',
        payload: friends,
      })
      message.success(t('removeBlackSuccessText'))
      logger.log('解除拉黑成功')
      setVisible(false)
      afterRemoveBlockFriend?.(props.account)
    } catch (error) {
      message.error(t('removeBlackFailedText'))
      logger.error('解除拉黑失败：', error)
    }
  }

  const handleOnSendMsgClick = async () => {
    setVisible(false)
    const scene = 'p2p'
    const sessionId = `${scene}-${props.account}`
    if (await nim.isSessionExist(sessionId)) {
      const session = await nim.getSession({ id: sessionId })
      dispatch({
        type: 'selectSession',
        payload: session,
      })
      logger.log('选中会话: ', session)
      resetSession(session)
    } else {
      const tempSession: NimKitCoreTypes.ISession = {
        ...props,
        id: sessionId,
        scene,
        to: props.account,
        unread: 0,
        updateTime: Date.now(),
        createTime: Date.now(),
        isMute: false,
      }
      dispatch({
        type: 'insertTempSession',
        payload: {
          isSelected: true,
          session: tempSession,
        },
      })
      logger.log('插入并选中临时会话: ', tempSession)
    }
    afterSendMsgClick?.()
  }

  const resetSession = useCallback(
    async (session: NimKitCoreTypes.ISession) => {
      let newSession = { ...session }
      try {
        if (session.unread) {
          await nim.resetSessionUnreadCount({
            id: session.id,
          })
          newSession = { ...session, unread: 0, unreadMsgs: [] }
        }
        dispatch({
          type: 'updateSessions',
          payload: [newSession],
        })
        logger.log('重置会话未读数成功')
      } catch (error) {
        logger.error('重置会话未读数失败：', error)
      }
    },
    [dispatch, nim]
  )

  return (
    <ComplexAvatarUI
      relation={relation}
      visible={visible}
      onCancel={handleCancel}
      onSave={handleSave}
      onAddFriendClick={handleOnAddFriendClick}
      onDeleteFriendClick={handleOnDeleteFriendClick}
      onBlockFriendClick={handleOnBlockFriendClick}
      onRemoveBlockFriendClick={handleOnRemoveBlockFriendClick}
      onSendMsglick={handleOnSendMsgClick}
      onAvatarClick={() => {
        setVisible(true)
      }}
      {...props}
    />
  )
}
