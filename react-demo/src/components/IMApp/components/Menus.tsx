import React, { FC, useEffect, useRef, useState } from 'react'
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

  const triggerRef = useRef(null) // 触发按钮的引用

  const dropdownRef = useRef(null) // 下拉菜单的引用

  // 监听全局点击事件
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 当点击元素不在触发器和下拉菜单内时，关闭菜单
      if (
        menuVisible &&
        //@ts-ignore
        !triggerRef?.current?.contains(event.target) &&
        //@ts-ignore
        !dropdownRef?.current?.contains(event.target)
      ) {
        resetMenuUI()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuVisible]) // 依赖项确保最新状态

  return (
    <div>
      <div
        ref={triggerRef}
        className="menu-icon"
        onClick={() => {
          setMenuVisible(true)
          setSubMenuVisible(false)
        }}
      >
        <i className="iconfont expand">&#xe72e;</i>
      </div>
      <MenuOptions
        ref={dropdownRef}
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
