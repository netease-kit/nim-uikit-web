import React, { FC } from 'react'
import classNames from 'classnames'
import { Modal } from 'antd'
import { t } from '../util'

interface IProps {
  onLogout?: () => void
  locale: 'zh' | 'en'
  openSettingModal: () => void
  resetMenuUI: () => void
  menuVisible: boolean
  subMenuVisible: boolean
  setMenuVisible: React.Dispatch<React.SetStateAction<boolean>>
  setSubMenuVisible: React.Dispatch<React.SetStateAction<boolean>>
}
const Menu: FC<IProps> = ({
  onLogout,
  locale,
  openSettingModal,
  resetMenuUI,
  menuVisible,
  subMenuVisible,
  setMenuVisible,
  setSubMenuVisible,
}) => {
  const logout = () => {
    Modal.confirm({
      title: t('logoutConfirmText'),
      onOk: () => {
        onLogout?.()
      },
    })
  }

  return menuVisible ? (
    <div
      className={classNames('menu-wrapper', 'show-menu')}
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
            sessionStorage.setItem('languageType', 'zh')
            window.location.reload()
          }}
        >
          中文
        </div>
        <div
          className={classNames('sub-menu-item', {
            active: locale === 'en',
          })}
          onClick={() => {
            sessionStorage.setItem('languageType', 'en')
            window.location.reload()
          }}
        >
          English
        </div>
      </div>
    </div>
  ) : null
}

export default Menu
