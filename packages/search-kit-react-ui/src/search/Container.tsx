import React, { useState, useContext } from 'react'
import { Context, useTranslation, useEventTracking } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons'
import { logger } from '../logger'
import SearchModal, { Section } from './components/SearchModal'
import { SectionListItem } from './components/SearchModal'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import packageJson from '../../package.json'

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
}

export const SearchContainer: React.FC<SearchContainerProps> = ({
  onClickChat,
  prefix = 'search',
  commonPrefix = 'common',
}) => {
  // 在这里汇聚所有需要用到的 Context，并完成数据的操作传递给纯渲染组件
  const { nim, state, dispatch, initOptions } = useContext(Context)

  // 这里需要对用到的 Context 中的值判空并做好提示
  if (!nim || !state || !dispatch || !initOptions) {
    throw new Error('Please use Provider to wrap SearchContainer.')
  }

  const { t } = useTranslation()

  useEventTracking({
    appkey: initOptions.appkey,
    version: packageJson.version,
    component: 'search-kit',
    imVersion: nim.version,
  })

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<Section[]>([])

  const handleChat = async (item: SectionListItem) => {
    let scene = ''
    let sessionId = ''
    if ((item as NimKitCoreTypes.IFriendInfo).account) {
      scene = 'p2p'
      // @ts-ignore
      sessionId = `${scene}-${item.account}`
    } else if ((item as Team).teamId) {
      scene = 'team'
      // @ts-ignore
      sessionId = `${scene}-${item.teamId}`
    }

    if (await nim.isSessionExist(sessionId)) {
      const session = await nim.getSession({ id: sessionId })
      dispatch({
        type: 'selectSession',
        payload: session,
      })
      logger.log('选中会话: ', session)
      setVisible(false)
    } else {
      let tempSession: NimKitCoreTypes.ISession
      if (scene === 'p2p') {
        const friend = (
          await nim.getUsersNameCardFromServer({
            // @ts-ignore
            accounts: [item.account],
          })
        )[0]
        tempSession = {
          ...friend,
          id: sessionId,
          scene,
          to: friend.account,
          unread: 0,
          updateTime: Date.now(),
          createTime: Date.now(),
          isMute: false,
        }
      } else {
        // @ts-ignore
        const team = await nim.getTeamInfo({ teamId: item.teamId })
        tempSession = {
          ...team,
          id: sessionId,
          scene: 'team',
          to: team.teamId,
          unread: 0,
          updateTime: Date.now(),
          createTime: Date.now(),
        }
      }
      dispatch({
        type: 'insertTempSession',
        payload: {
          isSelected: true,
          session: tempSession,
        },
      })
      logger.log('插入并选中临时会话: ', tempSession)
      setVisible(false)
    }
    onClickChat?.()
  }

  const handleOpenModal = async () => {
    if (loading) {
      return
    }
    setLoading(true)
    try {
      const [friends, teams] = await Promise.all([
        nim.getFriendList(),
        nim.getTeams(),
      ])
      dispatch({
        type: 'setFriends',
        payload: friends,
      })
      dispatch({
        type: 'updateGroups',
        payload: teams,
      })
      setDataSource([
        {
          id: 'friends',
          title: t('searchFriendTitle'),
          list: friends,
        },
        {
          id: 'groups',
          title: t('searchTeamTitle'),
          list: teams,
        },
      ])
      setLoading(false)
      setVisible(true)
      logger.log('获取好友列表和群组列表成功')
    } catch (error) {
      setLoading(false)
      logger.error('获取好友列表和群组列表失败：', error)
    }
  }

  const _prefix = `${prefix}-search`

  return (
    <div className={`${_prefix}-wrapper`}>
      <div className={`${_prefix}-wrapper-button`} onClick={handleOpenModal}>
        {loading ? <LoadingOutlined /> : <SearchOutlined />}
        <span className={`${_prefix}-wrapper-text`}>
          {t('searchInputPlaceholder')}
        </span>
      </div>
      <SearchModal
        visible={visible}
        dataSource={dataSource}
        onCancel={() => setVisible(false)}
        prefix={prefix}
        onResultItemClick={handleChat}
        commonPrefix={commonPrefix}
      />
    </div>
  )
}
