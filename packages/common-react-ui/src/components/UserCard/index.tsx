import React, { FC, useMemo } from 'react'
import { Modal, Button, Dropdown, Menu } from 'antd'
import {
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { CrudeAvatar } from '../CrudeAvatar'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { useTranslation } from '../../hooks/useTranslation'
import { Relation } from '../../contextManager/types'

export interface UserCardProps
  extends Omit<UserNameCard, 'createTime' | 'updateTime'> {
  visible: boolean
  relation: Relation
  onSendMsglick?: () => void
  onAddFriendClick?: () => void
  onDeleteFriendClick?: () => void
  onBlockFriendClick?: () => void
  onRemoveBlockFriendClick?: () => void
  onCancel?: () => void
  prefix?: string
}

export const UserCard: FC<UserCardProps> = ({
  visible,
  relation,
  onAddFriendClick,
  onDeleteFriendClick,
  onBlockFriendClick,
  onRemoveBlockFriendClick,
  onSendMsglick,
  onCancel,
  prefix = 'common',
  ...props
}) => {
  const _prefix = `${prefix}-usercard`

  const { t } = useTranslation()

  const genderOptions = useMemo(
    () => [
      { label: t('man'), value: 'male' },
      { label: t('woman'), value: 'female' },
      { label: t('unknow'), value: 'unknown' },
    ],
    []
  )

  const controlsMenuRenderer = useMemo(() => {
    const items = [
      relation === 'friend'
        ? {
            key: 'block',
            label: '拉黑好友',
            icon: <UsergroupAddOutlined />,
          }
        : {
            key: 'removeBlock',
            label: '解除拉黑',
            icon: <UsergroupDeleteOutlined />,
          },
      {
        key: 'deleteFriend',
        label: '删除好友',
        icon: <DeleteOutlined />,
      },
    ] as any

    return (
      <Menu
        onClick={(e) => {
          switch (e.key) {
            case 'block':
              onBlockFriendClick?.()
              break
            case 'removeBlock':
              onRemoveBlockFriendClick?.()
              break
            case 'deleteFriend':
              onDeleteFriendClick?.()
              break
            default:
              break
          }
        }}
        items={items}
      ></Menu>
    )
  }, [
    relation,
    onBlockFriendClick,
    onRemoveBlockFriendClick,
    onDeleteFriendClick,
  ])

  const contentRenderer = () => {
    return (
      <>
        <div className={`${_prefix}-header`}>
          <div className={`${_prefix}-header-avatar`}>
            <CrudeAvatar {...{ ...props, avatar: props.avatar, size: 50 }} />
          </div>
          <span className={`${_prefix}-header-nick`}>
            {props.nick || props.account}
          </span>
          {relation !== 'stranger' ? (
            <Dropdown overlay={controlsMenuRenderer}>
              <Button
                className={`${_prefix}-header-controls`}
                type="text"
                icon={<MoreOutlined />}
              ></Button>
            </Dropdown>
          ) : null}
        </div>
        <div className={`${_prefix}-content`}>
          <div className={`${_prefix}-content-form-item`}>
            <label>账号</label>
            <span className={`${_prefix}-content-form-item-text`}>
              {props.account}
            </span>
          </div>
          <div className={`${_prefix}-content-form-item`}>
            <label>性别</label>
            <span className={`${_prefix}-content-form-item-text`}>
              {
                (
                  genderOptions.find((item) => item.value === props.gender) || {
                    label: '未知',
                  }
                ).label
              }
            </span>
          </div>
          <div className={`${_prefix}-content-form-item`}>
            <label>手机</label>
            <span className={`${_prefix}-content-form-item-text`}>
              {props.tel || ''}
            </span>
          </div>
          <div className={`${_prefix}-content-form-item`}>
            <label>邮箱</label>
            <span className={`${_prefix}-content-form-item-text`}>
              {props.email || ''}
            </span>
          </div>
          <div className={`${_prefix}-content-form-item`}>
            <label>签名</label>
            <span className={`${_prefix}-content-form-item-text`}>
              {props.signature || ''}
            </span>
          </div>
        </div>
      </>
    )
  }

  const footerRenderer = useMemo(() => {
    return relation === 'stranger' ? (
      <Button
        className={`${_prefix}-footer-button`}
        type="primary"
        onClick={onAddFriendClick}
      >
        添加好友
      </Button>
    ) : (
      <Button
        className={`${_prefix}-footer-button`}
        type="primary"
        onClick={onSendMsglick}
      >
        发送消息
      </Button>
    )
  }, [_prefix, relation, onAddFriendClick, onSendMsglick])

  return (
    <Modal
      wrapClassName={`${_prefix}-modal`}
      visible={visible}
      footer={footerRenderer}
      maskClosable={true}
      closable={false}
      title={null}
      maskStyle={{ backgroundColor: 'rgba(255,255,255,0)' }}
      onCancel={onCancel}
    >
      {contentRenderer()}
    </Modal>
  )
}
