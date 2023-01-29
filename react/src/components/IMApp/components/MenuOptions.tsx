import React, { FC } from 'react'
import classNames from 'classnames'
import { demo_zh } from '../locales/demo_locale'
import { Modal } from 'antd'
interface IProps {
  onLogout?: () => void
  locale: 'zh' | 'en'
  changeLanguage?: (value: 'zh' | 'en') => void
  openSettingModal: () => void
  resetMenuUI: () => void
  menuVisible: boolean
  subMenuVisible: boolean
  setMenuVisible: React.Dispatch<React.SetStateAction<boolean>>
  setSubMenuVisible: React.Dispatch<React.SetStateAction<boolean>>
  t: (str: keyof typeof demo_zh) => string
}
const Menu: FC<IProps> = ({
  onLogout,
  locale,
  changeLanguage,
  openSettingModal,
  resetMenuUI,
  menuVisible,
  subMenuVisible,
  setMenuVisible,
  setSubMenuVisible,
  t,
}) => {
  const logout = () => {
    Modal.confirm({
      title: t('logoutConfirmText'),
      onOk: () => {
        onLogout()
      },
    })
  }
  return (
    <div
      className={classNames('menu-wrapper', {
        'show-menu': menuVisible,
      })}
      onMouseEnter={() => {
        setMenuVisible(true)
      }}
      onMouseLeave={resetMenuUI}
    >
      <div className="menu">
        <div
          onClick={() => setSubMenuVisible(!subMenuVisible)}
          className={classNames('menu-item', {
            'menu-bg': subMenuVisible,
          })}
        >
          <i className="iconfont language">&#xe728;</i>
          <div>{locale == 'zh' ? '中文' : 'English'}</div>
          <i className="iconfont arrow">&#xe72d;</i>
        </div>
        <div className="menu-item" onClick={() => openSettingModal()}>
          <i className="iconfont seeting">&#xe6d6;</i>
          <div>{t('settingText')}</div>
        </div>
        <div className="menu-item" onClick={() => logout()}>
          <i className="iconfont logout">&#xe729;</i>
          <div>{t('logoutText')}</div>
        </div>
      </div>
      <div
        className={classNames('sub-menu', {
          'show-sub-menu': subMenuVisible,
        })}
      >
        <div
          className={classNames('sub-menu-item', {
            active: locale === 'zh',
          })}
          onClick={() => {
            changeLanguage?.('zh')
            resetMenuUI()
          }}
        >
          中文
        </div>
        <div
          className={classNames('sub-menu-item', {
            active: locale === 'en',
          })}
          onClick={() => {
            changeLanguage?.('en')
            resetMenuUI()
          }}
        >
          English
        </div>
      </div>
    </div>
  )
}

export default Menu
