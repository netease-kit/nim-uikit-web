import React, { FC, useState } from 'react'
import MenuOptions from './MenuOptions'
import '../index.less'

interface IProps {
  onLogout?: () => void
  locale: 'zh' | 'en'
  openSettingModal: () => void
}
const MenuIcon: FC<IProps> = ({ onLogout, locale, openSettingModal }) => {
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
        openSettingModal={openSettingModal}
        resetMenuUI={resetMenuUI}
        menuVisible={menuVisible}
        subMenuVisible={subMenuVisible}
        setMenuVisible={setMenuVisible}
        setSubMenuVisible={setSubMenuVisible}
      />
    </div>
  )
}

export default MenuIcon
