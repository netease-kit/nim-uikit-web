import React, { FC, useState, useMemo, useEffect } from 'react'
import { Modal, Button, Dropdown, Menu, Input } from 'antd'
import {
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { CrudeAvatar } from '../CrudeAvatar'
import { useTranslation } from '../../hooks/useTranslation'
import { Relation } from '@xkit-yx/im-store-v2'

export enum Gender {
  unknown = 0,
  male = 1,
  female = 2,
}

export interface UserCardProps {
  account: string
  nick?: string
  avatar?: string
  signature?: string
  gender?: Gender
  email?: string
  birth?: string
  tel?: string
  ext?: string
  alias?: string
  visible: boolean
  relation: Relation
  isInBlacklist: boolean
  onChangeAlias?: (alias: string) => void
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
  isInBlacklist,
  onChangeAlias,
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

  const [alias, setAlias] = useState('')

  const genderOptions = useMemo(
    () => [
      { label: t('man'), value: Gender.male },
      { label: t('woman'), value: Gender.female },
      { label: t('unknow'), value: Gender.unknown },
    ],
    [t]
  )

  const controlsMenuRenderer = useMemo(() => {
    const items = (
      [
        isInBlacklist
          ? {
              key: 'removeBlock',
              label: t('removeBlackText'),
              icon: <UsergroupDeleteOutlined />,
            }
          : {
              key: 'block',
              label: t('blackText'),
              icon: <UsergroupAddOutlined />,
            },
        relation === 'friend'
          ? {
              key: 'deleteFriend',
              label: t('deleteFriendText'),
              icon: <DeleteOutlined />,
            }
          : null,
      ] as any
    ).filter((item) => !!item)

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
    t,
    relation,
    isInBlacklist,
    onBlockFriendClick,
    onRemoveBlockFriendClick,
    onDeleteFriendClick,
  ])

  useEffect(() => {
    setAlias(props.alias || '')
  }, [props.alias])

  const handleChangeAlias = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlias(e.target.value.trim())
  }

  const handleBlurAlias = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeAlias?.(e.target.value.trim())
  }

  const contentRenderer = () => {
    return (
      <>
        <div className={`${_prefix}-header`}>
          <div className={`${_prefix}-header-avatar`}>
            <CrudeAvatar {...{ ...props, avatar: props.avatar, size: 50 }} />
          </div>
          <span className={`${_prefix}-header-nick`}>
            {props.alias || props.nick || props.account}
          </span>
          {relation !== 'ai' ? (
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
          {relation === 'friend' ? (
            <div className={`${_prefix}-content-form-item`}>
              <label>{t('aliasText')}</label>
              <Input
                className={`${_prefix}-content-form-item-text`}
                onBlur={handleBlurAlias}
                onChange={handleChangeAlias}
                maxLength={15}
                value={alias}
              />
            </div>
          ) : null}
          <div className={`${_prefix}-content-form-item`}>
            <label>{t('accountText')}</label>
            <span className={`${_prefix}-content-form-item-text`}>
              {props.account}
            </span>
          </div>
          {relation !== 'ai' ? (
            <div className={`${_prefix}-content-form-item`}>
              <label>{t('genderText')}</label>
              <span className={`${_prefix}-content-form-item-text`}>
                {
                  (
                    genderOptions.find(
                      (item) => item.value === props.gender
                    ) || {
                      label: t('unknow'),
                    }
                  ).label
                }
              </span>
            </div>
          ) : null}
          {relation !== 'ai' ? (
            <div className={`${_prefix}-content-form-item`}>
              <label>{t('phoneText')}</label>
              <span className={`${_prefix}-content-form-item-text`}>
                {props.tel || ''}
              </span>
            </div>
          ) : null}
          {relation !== 'ai' ? (
            <div className={`${_prefix}-content-form-item`}>
              <label>{t('emailText')}</label>
              <span className={`${_prefix}-content-form-item-text`}>
                {props.email || ''}
              </span>
            </div>
          ) : null}
          <div className={`${_prefix}-content-form-item`}>
            <label>{t('signText')}</label>
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
        {t('addFriendText')}
      </Button>
    ) : (
      <Button
        className={`${_prefix}-footer-button`}
        type="primary"
        onClick={onSendMsglick}
      >
        {t('sendText')}
      </Button>
    )
  }, [t, _prefix, relation, onAddFriendClick, onSendMsglick])

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
