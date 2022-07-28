import React, { FC, useEffect, useState, useMemo } from 'react'
import { Modal, Input, Select, Upload, message } from 'antd'
import { CrudeAvatar } from '../CrudeAvatar'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { useTranslation } from '../../hooks/useTranslation'

export interface MyUserCardProps
  extends Omit<UserNameCard, 'createTime' | 'updateTime'> {
  visible: boolean
  onSave?: (
    params: Pick<
      UserNameCard,
      'avatar' | 'email' | 'gender' | 'nick' | 'tel' | 'signature'
    > & { avatarFile?: File }
  ) => void
  onCancel?: () => void
  prefix?: string
}

export const MyUserCard: FC<MyUserCardProps> = ({
  visible,
  onSave,
  onCancel,
  prefix = 'common',
  ...props
}) => {
  const _prefix = `${prefix}-mycard`

  const { t } = useTranslation()

  const genderOptions = useMemo(
    () => [
      { label: t('man'), value: 'male' },
      { label: t('woman'), value: 'female' },
      { label: t('unknow'), value: 'unknown' },
    ],
    []
  )

  const [nick, setNick] = useState<string | undefined>(undefined)
  // base64 编码的头像，用于预览
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  // 头像 file 对象，用于上传
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined)
  const [gender, setGender] = useState<
    'unknown' | 'male' | 'female' | undefined
  >(undefined)
  const [tel, setTel] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [signature, setSignature] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (props.nick) {
      setNick(props.nick)
    }
  }, [props.nick])

  useEffect(() => {
    if (props.avatar) {
      setAvatar(props.avatar)
    }
  }, [props.avatar])

  useEffect(() => {
    if (props.gender) {
      setGender(props.gender)
    }
  }, [props.gender])

  useEffect(() => {
    if (props.tel) {
      setTel(props.tel)
    }
  }, [props.tel])

  useEffect(() => {
    if (props.email) {
      setEmail(props.email)
    }
  }, [props.email])

  useEffect(() => {
    if (props.signature) {
      setSignature(props.signature)
    }
  }, [props.signature])

  const handleSave = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (
      email &&
      !email.includes('@') &&
      !email.includes('com') &&
      !email.includes('cn')
    ) {
      message.error(t('emailErrorText'))
      return
    }
    onSave?.({
      avatar,
      avatarFile,
      nick,
      gender,
      tel,
      email,
      signature,
    })
  }

  const handleBeforeUpload = (file: any, FileList: any[]) => {
    const LIMIT = 5
    const isLt5M = file.size / 1024 / 1024 < LIMIT
    if (!isLt5M) {
      message.error(`${t('uploadLimitText')}${LIMIT}${t('uploadLimitUnit')}`)
    }
    return isLt5M
  }

  const handleUpload = (file: any): any => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setAvatar(reader.result as string)
      setAvatarFile(file)
    }

    reader.onerror = (error) => {
      message.error(t('uploadImgFailedText'))
      throw error
    }
  }

  const contentRenderer = () => {
    return (
      <>
        <div className={`${_prefix}-header`}>
          <div className={`${_prefix}-header-avatar`}>
            <Upload
              beforeUpload={handleBeforeUpload}
              showUploadList={false}
              accept=".jpg,.png,.jpeg"
              action={handleUpload}
            >
              <CrudeAvatar
                {...{ ...props, avatar: avatar || props.avatar, size: 50 }}
              />
            </Upload>
          </div>
          <span className={`${_prefix}-header-nick`}>
            {props.nick || props.account}
          </span>
        </div>
        <div className={`${_prefix}-content`}>
          <div className={`${_prefix}-content-form-item`}>
            <label>{t('accountText')}</label>
            <Input value={props.account} disabled />
          </div>
          <div className={`${_prefix}-content-form-item`}>
            <label>{t('nickText')}</label>
            <Input
              value={nick}
              maxLength={30}
              placeholder={t('nickPlaceholder')}
              onChange={(e) => {
                setNick(e.target.value)
              }}
            />
          </div>
          <div className={`${_prefix}-content-form-item`}>
            <label>{t('genderText')}</label>
            <Select
              style={{ width: '100%' }}
              options={genderOptions}
              value={gender}
              placeholder={t('genderPlaceholder')}
              onChange={setGender}
            />
          </div>
          <div className={`${_prefix}-content-form-item`}>
            <label>{t('phoneText')}</label>
            <Input
              value={tel}
              maxLength={11}
              placeholder={t('phonePlaceholder')}
              onChange={(e) => {
                setTel(e.target.value.replace(/\D/g, ''))
              }}
            />
          </div>
          <div className={`${_prefix}-content-form-item`}>
            <label>{t('emailText')}</label>
            <Input
              value={email}
              maxLength={30}
              placeholder={t('emailPlaceholder')}
              onChange={(e) => {
                setEmail(e.target.value)
              }}
            />
          </div>
          <div className={`${_prefix}-content-form-item`}>
            <label>{t('signText')}</label>
            <Input.TextArea
              value={signature}
              maxLength={50}
              style={{ resize: 'none' }}
              placeholder={t('signPlaceholder')}
              onChange={(e) => {
                setSignature(e.target.value)
              }}
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <Modal
      wrapClassName={`${_prefix}-modal`}
      visible={visible}
      maskClosable={true}
      closable={false}
      title={null}
      maskStyle={{ backgroundColor: 'rgba(255,255,255,0)' }}
      okText={t('saveText')}
      cancelText={t('cancelText')}
      onOk={handleSave}
      onCancel={onCancel}
    >
      {contentRenderer()}
    </Modal>
  )
}
