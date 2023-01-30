import React, { FC, useEffect, useState, useMemo } from 'react'
import { Modal, Input, Select, Upload, message, Form } from 'antd'
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

  const resetState = () => {
    setNick(props.nick)
    setAvatar(props.avatar)
    setGender(props.gender)
    setTel(props.tel)
    setEmail(props.email)
    setSignature(props.signature)
  }

  const handleCancel = () => {
    resetState()
    onCancel?.()
  }

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
          <Form labelCol={{ span: 6 }}>
            <Form.Item label={t('accountText')}>
              <div className={`${_prefix}-content-form-item`}>
                <Input value={props.account} disabled />
              </div>
            </Form.Item>
            <Form.Item label={t('nickText')}>
              <div className={`${_prefix}-content-form-item`}>
                <Input
                  value={nick}
                  maxLength={15}
                  placeholder={t('nickPlaceholder')}
                  onChange={(e) => {
                    setNick(e.target.value)
                  }}
                />
              </div>
            </Form.Item>
            <Form.Item label={t('genderText')}>
              <div className={`${_prefix}-content-form-item`}>
                <Select
                  style={{ width: '100%' }}
                  options={genderOptions}
                  value={gender}
                  placeholder={t('genderPlaceholder')}
                  onChange={setGender}
                />
              </div>
            </Form.Item>
            <Form.Item label={t('phoneText')}>
              <div className={`${_prefix}-content-form-item`}>
                <Input
                  value={tel}
                  maxLength={11}
                  placeholder={t('phonePlaceholder')}
                  onChange={(e) => {
                    setTel(e.target.value.replace(/\D/g, ''))
                  }}
                />
              </div>
            </Form.Item>
            <Form.Item label={t('emailText')}>
              <div className={`${_prefix}-content-form-item`}>
                <Input
                  value={email}
                  maxLength={30}
                  placeholder={t('emailPlaceholder')}
                  onChange={(e) => {
                    setEmail(e.target.value)
                  }}
                />
              </div>
            </Form.Item>
            <Form.Item label={t('signText')}>
              <div className={`${_prefix}-content-form-item`}>
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
            </Form.Item>
          </Form>
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
      onCancel={handleCancel}
      width={370}
    >
      {contentRenderer()}
    </Modal>
  )
}
