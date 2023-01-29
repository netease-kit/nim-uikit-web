import React, { FC, useState } from 'react'
import MenuOptions from './MenuOptions'
import { demo_zh } from '../locales/demo_locale'
import '../index.less'
interface IProps {
  onLogout?: () => void
  locale: 'zh' | 'en'
  changeLanguage?: (value: 'zh' | 'en') => void
  openSettingModal: () => void
  t: (str: keyof typeof demo_zh) => string
}
const MenuIcon: FC<IProps> = ({
  onLogout,
  locale,
  changeLanguage,
  openSettingModal,
  t,
}) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false)
  const [subMenuVisible, setSubMenuVisible] = useState<boolean>(false)
  const resetMenuUI = () => {
    setMenuVisible(false)
    setSubMenuVisible(false)
  }

  return (
    <div>
      <div
        className="menu-icon"
        onMouseEnter={() => {
          setMenuVisible(true)
          setSubMenuVisible(false)
        }}
      >
        <i className="iconfont expand">&#xe72e;</i>
      </div>
      <MenuOptions
        onLogout={onLogout}
        locale={locale}
        changeLanguage={changeLanguage}
        openSettingModal={openSettingModal}
        resetMenuUI={resetMenuUI}
        menuVisible={menuVisible}
        subMenuVisible={subMenuVisible}
        setMenuVisible={setMenuVisible}
        setSubMenuVisible={setSubMenuVisible}
        t={t}
      />
    </div>
  )
}

export default MenuIcon
