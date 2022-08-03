import { Button, message, Modal } from 'antd'
import { SearchInput, useTranslation } from '@xkit-yx/common-ui'
import React, { useState, useEffect } from 'react'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'

// TODO search 组件整体数据流动有些混乱，需要重构

//Promise<Team | FriendProfile | UserNameCard[] | void >
interface AddModalItemProps {
  account: string
  avatar?: string
  name: string
  handleOk: (
    state: string,
    account?: string
  ) =>
    | void
    | Promise<boolean | undefined>
    | Promise<void>
    | Promise<Team | FriendProfile | undefined>
    | Promise<Team | UserNameCard[] | undefined>
  prefix?: string
}

const AddModalItem: React.FC<AddModalItemProps> = ({
  account,
  avatar,
  name,
  handleOk,
  prefix = 'search',
}) => {
  const _prefix = `${prefix}-add-modal-item`

  const { t } = useTranslation()

  const [btnContent, setBtnContent] = useState(t('addButtonText'))

  useEffect(() => {
    if (account) {
      const res = handleOk('getRelation', account) as Promise<
        boolean | undefined
      >
      res
        .then((val) => {
          if (val) {
            setBtnContent(t('chatButtonText'))
          }
        })
        .catch((err) => {
          message.error(t('getRelationFailedText'))
          console.error('获取关系失败：', err)
        })
    }
  }, [account])

  const onClick = () => {
    if (btnContent === t('addButtonText')) {
      const res = handleOk('add', account) as Promise<
        FriendProfile | Team | undefined
      >
      res
        .then(() => {
          message.success(t('addSuccessText'))
          setBtnContent(t('chatButtonText'))
          handleOk('update')
        })
        .catch((err) => {
          message.error(t('addFailedText'))
          console.error('添加失败：', err)
        })
    } else if (btnContent === t('chatButtonText')) {
      handleOk('chat', account)
    }
  }

  const avatarComponent = () => {
    if (avatar) {
      return <img src={avatar} className={`${_prefix}-avatar`} />
    } else {
      const avatarText =
        name.length > 2 ? name.substring(name.length - 2) : name
      const backgroundColor = ['#60CFA7', '#53C3F3', '#537FF4'][
        parseInt(Math.random() * (2 - 0 + 1) + 0 + '', 10)
      ]

      return (
        <div className={`${_prefix}-avatar`} style={{ backgroundColor }}>
          {avatarText}
        </div>
      )
    }
  }

  return (
    <div className={_prefix}>
      {avatarComponent()}
      <div className={`${_prefix}-info`}>
        <div className={`${_prefix}-info-name`}>{name || account}</div>
        <div className={`${_prefix}-info-account`}>{account}</div>
      </div>
      <Button type="primary" onClick={onClick}>
        {btnContent}
      </Button>
    </div>
  )
}

export interface AddModalProps {
  title: string
  visible: boolean
  handleOk: (
    state: string,
    account?: string
  ) =>
    | void
    | Promise<boolean | undefined>
    | Promise<void>
    | Promise<Team | FriendProfile | undefined>
    | Promise<Team | UserNameCard[] | undefined>
  onCancel?: () => void
  placeholder?: string
  prefix?: string
  commonPrefix?: string
}

const AddModal: React.FC<AddModalProps> = ({
  title,
  visible = false,
  placeholder,
  handleOk,
  onCancel,
  prefix = 'search',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-add-modal`
  const state = 'search'

  const { t } = useTranslation()

  placeholder = placeholder || t('accountPlaceholder')

  const [searchValue, setSearchValue] = useState('')
  const [account, setAccount] = useState('')
  const [isEmpty, setIsEmpty] = useState(true)
  const [avatar, setAvatar] = useState('')
  const [name, setName] = useState('')
  const [emptyContent, setEmptyContent] = useState('')
  const [btnFlag, setBtnFlag] = useState(false)
  const onChange = (val: string) => {
    setSearchValue(val)
    if (btnFlag) {
      setIsEmpty(true)
      setEmptyContent('')
      setBtnFlag(false)
    }
  }

  const handleSearch = () => {
    setAccount('')
    setAvatar('')
    setName('')
    const res = handleOk(state, searchValue) as Promise<
      Team | UserNameCard[] | undefined
    >
    res
      .then((data) => {
        if (Array.isArray(data)) {
          if (data.length !== 0) {
            setIsEmpty(false)
            setAccount(data[0].account)
            if (data[0].avatar) {
              setAvatar(data[0].avatar)
            }
            setName(data[0].nick!)
          } else {
            setIsEmpty(true)
            setEmptyContent(t('accountNotMatchText'))
          }
        } else {
          const _data = data as Team
          if (_data && JSON.stringify(_data) !== '{}') {
            setIsEmpty(false)
            setAccount(_data.teamId)
            if (_data.avatar) {
              setAvatar(_data.avatar)
            }
            setName(_data.name)
          } else {
            setIsEmpty(true)
            setEmptyContent(t('accountNotMatchText'))
          }
        }
        setBtnFlag(true)
      })
      .catch(() => {
        setIsEmpty(true)
        setEmptyContent(t('accountNotMatchText'))
      })
  }

  const footer = (
    <div className={`${_prefix}-footer`}>
      <Button onClick={() => onCancel?.()}>{t('cancelText')}</Button>
      <Button onClick={() => handleSearch()} type="primary">
        {t('searchButtonText')}
      </Button>
    </div>
  )

  const init = () => {
    setEmptyContent('')
    setIsEmpty(true)
    setAvatar('')
    setSearchValue('')
  }

  return (
    <div>
      <Modal
        className={_prefix}
        title={title}
        onCancel={() => onCancel?.()}
        visible={visible}
        width={460}
        destroyOnClose={true}
        afterClose={init}
        footer={isEmpty ? footer : null}
      >
        <SearchInput
          placeholder={placeholder}
          prefix={commonPrefix}
          onChange={onChange}
        />
        {isEmpty ? (
          <div className={`${_prefix}-empty-content`}>{emptyContent}</div>
        ) : (
          <AddModalItem
            avatar={avatar}
            account={account}
            name={name}
            prefix={prefix}
            handleOk={handleOk}
          />
        )}
      </Modal>
    </div>
  )
}

export default AddModal
