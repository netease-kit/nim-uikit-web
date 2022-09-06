import React, { useState } from 'react'
import {
  useTranslation,
  useEventTracking,
  useStateContext,
} from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { SearchOutlined } from '@ant-design/icons'
import SearchModal from './components/SearchModal'
import { SectionListItem } from './components/SearchModal'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import packageJson from '../../package.json'
import { TMsgScene } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { observer } from 'mobx-react'

export interface SearchContainerProps {
  /**
   点击去聊天回调
   */
  onClickChat?: () => void

  /**
    样式前缀
    */
  prefix?: string

  /**
   公共样式前缀
   */
  commonPrefix?: string

  /**
   没有好友和群组时的状态展示
   */
  renderEmpty?: () => JSX.Element
}

export const SearchContainer: React.FC<SearchContainerProps> = observer(
  ({
    onClickChat,
    prefix = 'search',
    commonPrefix = 'common',
    renderEmpty,
  }) => {
    const { nim, store, initOptions } = useStateContext()

    const { t } = useTranslation()

    useEventTracking({
      appkey: initOptions.appkey,
      version: packageJson.version,
      component: 'search-kit',
      imVersion: nim.version,
    })

    const [visible, setVisible] = useState(false)

    const handleChat = async (item: SectionListItem) => {
      let scene: TMsgScene
      let to = ''
      if ((item as NimKitCoreTypes.IFriendInfo).account) {
        scene = 'p2p'
        to = (item as NimKitCoreTypes.IFriendInfo).account
      } else if ((item as Team).teamId) {
        scene = 'team'
        to = (item as Team).teamId
      } else {
        throw Error('unknow scene')
      }

      await store.sessionStore.insertSessionActive(scene, to)
      setVisible(false)
      onClickChat?.()
    }

    const handleOpenModal = async () => {
      setVisible(true)
    }

    const _prefix = `${prefix}-search`

    return (
      <div className={`${_prefix}-wrapper`}>
        <div className={`${_prefix}-wrapper-button`} onClick={handleOpenModal}>
          {<SearchOutlined />}
          <span className={`${_prefix}-wrapper-text`}>
            {t('searchInputPlaceholder')}
          </span>
        </div>
        <SearchModal
          visible={visible}
          friends={store.uiStore.friendsWithoutBlacklist}
          teams={store.uiStore.teamList}
          onCancel={() => setVisible(false)}
          prefix={prefix}
          onResultItemClick={handleChat}
          renderEmpty={renderEmpty}
          commonPrefix={commonPrefix}
        />
      </div>
    )
  }
)
