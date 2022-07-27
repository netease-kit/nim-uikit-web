import React, { useContext, useEffect, useState } from 'react'
import { Input, Form, Modal, Button, Divider, message } from 'antd'
import { getLoginSmsCode, loginRegisterByCode } from '../../utils/api'
import { FormInstance } from 'antd/lib/form'
import logger from '../../utils/logger'
import LoginContext from '../context'
const BackUrl = require('../../assets/icon_back.png')

export interface IProps {
  success?: (res: any) => void // 登录成功回调
  fail?: (error: any) => void // 登录失败回调
  handleBack: () => void
}

const LoginForm: React.FC<IProps> = (props: IProps) => {
  const { handleBack } = props
  const { success, fail } = useContext(LoginContext)
  const [loginLoading, setLoginLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isFirstRegister, setFirstRegister] = useState(false)
  const [countTime, setCountTime] = useState(0)

  const handleOk = () => {
    setIsModalVisible(false)
    login()
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const loginRef = React.createRef<FormInstance>()

  useEffect(() => {
    if (countTime !== 0) {
      const timer = setTimeout(() => {
        setCountTime(countTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countTime])

  // 发送验证码
  const sendSmsCode = async () => {
    if (countTime !== 0) return
    if (!window.navigator.onLine) {
      message.warning('当前网络已断开，请检查网络')
      return
    }
    // 表单校验
    const mobile = await loginRef.current?.validateFields(['mobile'])
    try {
      const res = await getLoginSmsCode(mobile)
      message.success('验证码发送成功')
      logger.log('getLoginSmsCode res', res)
      setCountTime(60)
      if (res.isFirstRegister) {
        setFirstRegister(true)
      }
    } catch (err: any) {
      logger.log('getLoginSmsCode err', err.msg)
      if (err.msg) {
        message.error(err.msg)
      }
    }
  }

  // 提交
  const onSubmit = async () => {
    if (!window.navigator.onLine) {
      message.warning('当前网络已断开，请检查网络')
      return
    }
    // 表单校验
    await loginRef.current
      ?.validateFields()
      .then((values) => {
        // 第一次登录弹出温馨提示
        if (isFirstRegister) {
          setIsModalVisible(true)
        } else {
          login()
        }
      })
      .catch((err) => {
        logger.log('表单校验失败', err)
        message.warning('请检查表单信息')
      })
  }

  const login = async () => {
    // 验证码登录
    const { mobile, smsCode } = await loginRef.current?.getFieldsValue()

    loginRegisterByCode({ mobile, smsCode })
      .then((res) => {
        if (res) {
          setFirstRegister(false)
          setLoginLoading(false)
          message.success('登录成功')
          success?.(res)
        }
      })
      .catch((err) => {
        setLoginLoading(false)
        fail?.(err)
        if (err.msg) {
          message.error(err.msg)
        }
        logger.log('login error', err.msg)
      })
  }

  const onFinishFailed = (errorInfo: any) => {
    logger.log('onFinishFailed', errorInfo)
  }
  const checkAccount = (_: any, value: string) => {
    const reg =
      /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
    if (!value) {
      return Promise.reject(new Error('请输入手机号'))
    }
    if (value.length == 11 && reg.test(value)) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('请检查手机号格式'))
    }
  }

  return (
    <div className="login-form">
      <img
        onClick={() => handleBack()}
        className="login-back-icon"
        src={BackUrl}
        alt=""
      />
      <h2 className="login-title">验证码登录</h2>
      <div className="login-sub-title">
        未注册的手机号码验证通过后将自动注册
      </div>
      <div>
        <Form
          ref={loginRef}
          name="loginForm"
          initialValues={{ remember: true }}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          validateTrigger="onSubmit"
        >
          <Form.Item
            name="mobile"
            style={{ marginBottom: '0px' }}
            rules={[
              { required: true, message: '' },
              { validator: checkAccount },
            ]}
          >
            <div className="mobile">
              <Input
                prefix={<span className="area-code">+86</span>}
                className="login-input"
                placeholder="请输入手机号"
                bordered={false}
                maxLength={11}
                allowClear
              />
            </div>
          </Form.Item>
          <Divider style={{ margin: '0 0 20px' }} />
          <Form.Item
            name="smsCode"
            style={{ marginBottom: '0px' }}
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input
              className="login-input"
              placeholder="请输入验证码"
              suffix={
                <span onClick={sendSmsCode} className="sms-code-text">
                  {countTime !== 0 ? countTime + 's' : '获取验证码'}
                </span>
              }
              bordered={false}
              maxLength={8}
            />
          </Form.Item>
          <Divider style={{ margin: '0 0 48px' }} />
          <Button
            className="login-btn primary"
            onClick={onSubmit}
            type="primary"
            block
            loading={loginLoading}
          >
            登录
          </Button>
        </Form>
      </div>
      <Modal
        title="温馨提示"
        width={300}
        cancelText="不同意"
        okText="已阅读并同意"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p className="text-justify">
          在您注册云信产品账号过程中，您需要完成注册流程并确认同意在线签署
          <a
            target="_blank"
            href="https://doc.yunxin.163.com/docs/Dk4MjYxNzQ/TI3NTQwNjQ"
          >
            《云呼叫中心服务条款》
          </a>
          （以下简称“法律文件”）。
          请您在确认同意之前务必仔细阅读、充分理解法律文件中的条款内容，尤其是在法律文件中以粗体或下划线标识的条款部分。
          如果您不同意上述法律文件或其中的任何条款约定，请您停止注册。如您在按照注册流程提示填写信息、阅读并确认同意上述法律文件且完成注册流程后，
          即表示您以充分阅读、理解并接受上述法律文件的全部内容；并表明您同意云信可以依据法律文件约定来处理您的个人信息。。
        </p>
      </Modal>
    </div>
  )
}

export default LoginForm
