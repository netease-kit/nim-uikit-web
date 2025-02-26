import React, { useCallback, useState } from 'react'
import { useTranslation, useEventTracking, useStateContext } from '../../common'
import { SearchOutlined } from '@ant-design/icons'
import SearchModal, { SectionListItem } from './components/SearchModal'
import packageJson from '../../../package.json'
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import { V2NIMConversationType } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMConversationService'
import { V2NIMFriend } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMFriendService'
import { V2NIMUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService'
import { observer } from 'mobx-react'
// todo, v10.6.0 有静态方法可以获取版本号
import sdkPkg from 'nim-web-sdk-ng/package.json'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

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

  /**
   没有搜索结果时的自定义渲染
   */
  renderSearchResultEmpty?: () => JSX.Element
}

export const SearchContainer: React.FC<SearchContainerProps> = observer(
  ({
    onClickChat,
    prefix = 'search',
    commonPrefix = 'common',
    renderEmpty,
    renderSearchResultEmpty,
  }) => {
    const { nim, store } = useStateContext()

    const { t } = useTranslation()

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'SearchUIKit',
      imVersion: sdkPkg.version,
    })

    const [visible, setVisible] = useState(false)

    const handleChat = useCallback(
      async (item: SectionListItem) => {
        let conversationType: V2NIMConversationType
        let receiverId = ''

        if ((item as V2NIMFriend & V2NIMUser).accountId) {
          conversationType =
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
          receiverId = (item as V2NIMFriend & V2NIMUser).accountId
        } else if ((item as V2NIMTeam).teamId) {
          conversationType =
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
          receiverId = (item as V2NIMTeam).teamId
        } else {
          throw Error('unknow scene')
        }

        if (store.localOptions.enableLocalConversation) {
          await store.localConversationStore?.insertConversationActive(
            conversationType,
            receiverId
          )
        } else {
          await store.conversationStore?.insertConversationActive(
            conversationType,
            receiverId
          )
        }

        setVisible(false)
        onClickChat?.()
      },
      [onClickChat, store.conversationStore]
    )

    const handleOpenModal = async () => {
      setVisible(true)
    }

    const _prefix = `${prefix}-search`

    const friendsWithoutBlacklist = store.uiStore.friends
      .filter((item) => !store.relationStore.blacklist.includes(item.accountId))
      .map((item) => {
        const user: V2NIMUser = store.userStore.users.get(item.accountId) || {
          accountId: '',
          name: '',
          createTime: Date.now(),
        }

        return {
          ...item,
          ...user,
        }
      })

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
          friends={friendsWithoutBlacklist}
          teams={store.uiStore.teamList}
          onCancel={() => setVisible(false)}
          prefix={prefix}
          onResultItemClick={handleChat}
          renderEmpty={renderEmpty}
          renderSearchResultEmpty={renderSearchResultEmpty}
          commonPrefix={commonPrefix}
        />
      </div>
    )
  }
)
