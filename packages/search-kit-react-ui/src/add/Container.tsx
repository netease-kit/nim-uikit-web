import React, { useState, useContext } from 'react'
import { Context, useTranslation, useEventTracking } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { logger } from '../logger'
import AddPanel from './components/AddPanel'
import AddModal from './components/AddModal'
import CreateModal from './components/CreateModal'
import { CreateTeamOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { TeamInfo } from './components/CreateModal'
import packageJson from '../../package.json'

export interface AddContainerProps {
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

export const AddContainer: React.FC<AddContainerProps> = ({
  onClickChat,
  prefix = 'search',
  commonPrefix = 'common',
}) => {
  // 在这里汇聚所有需要用到的 Context，并完成数据的操作传递给纯渲染组件
  const { nim, state, dispatch, initOptions } = useContext(Context)

  // 这里需要对用到的 Context 中的值判空并做好提示
  if (!nim || !state || !dispatch || !initOptions) {
    throw new Error('Please use Provider to wrap AddContainer.')
  }

  const { t } = useTranslation()

  useEventTracking({
    appkey: initOptions.appkey,
    version: packageJson.version,
    component: 'search-kit',
    imVersion: nim.version,
  })

  const [addModalVisible, setAddModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [title, setTitle] = useState(t('addFriendText'))

  const [componentId, setComponentId] = useState(0)

  const onClick = (id: number) => {
    setComponentId(id)
    switch (id) {
      case 0:
        setTitle(t('addFriendText'))
        setAddModalVisible(true)
        break
      case 1:
        setTitle(t('createTeamText'))
        setCreateModalVisible(true)
        break
      case 2:
        setTitle(t('joinTeamText'))
        setAddModalVisible(true)
      default:
        break
    }
  }

  const handleAddOk = (state: string, account?: string) => {
    switch (state) {
      case 'search':
        return addModalSearch(componentId, account!)
      case 'add': // 添加
        return addModalAdd(componentId, account!)
      case 'update': // 更新好友列表
        return handleUpdate(componentId)
      case 'chat': // 去聊天
        return handleChat(componentId, account!)
      case 'getRelation': // 获取好友关系
        return addModalGetRelation(componentId, account!)
      default:
        return new Promise<void>(() => {
          /* empty */
        })
    }
  }

  const handleCreateOk = async (
    state: string,
    teamInfo: TeamInfo,
    teamId?: string
  ) => {
    if (state === 'create') {
      const accounts: Array<string> = teamInfo.selectedList
        .map((item) => item.account)
        .concat(initOptions.account)
      const createTeamParams: CreateTeamOptions = {
        type: 'advanced',
        name: teamInfo.groupName,
        accounts: accounts,
        joinMode: 'noVerify',
        beInviteMode: 'noVerify',
        inviteMode: 'all',
        updateTeamMode: 'manager',
        updateExtMode: 'manager',
      }
      if (teamInfo.avatarUrl !== '') {
        createTeamParams['avatar'] = teamInfo.avatarUrl
      }
      return await nim.createTeam(createTeamParams)
    } else {
      return handleChat(1, teamId!)
    }
  }

  const addModalOnCancel = () => {
    setAddModalVisible(false)
  }
  const createModalOnCancel = () => {
    setCreateModalVisible(false)
  }
  const addModalSearch = async (id: number, account: string) => {
    if (id === 0) {
      return await nim.getUsersNameCardFromServer({
        accounts: [account],
      })
    } else if (id === 2) {
      return await nim.getTeamInfo({ teamId: account })
    }
  }
  const addModalAdd = async (id: number, account: string) => {
    if (id === 0) {
      return await nim.addFriend({ account })
    } else if (id === 2) {
      return await nim.applyTeam({ teamId: account })
    }
  }
  const addModalGetRelation = async (id: number, targetId: string) => {
    if (id === 0) {
      const result = await nim.getFriends()
      return result.some((item) => item.account === targetId)
    } else if (id === 2) {
      const result = await nim.getTeams()
      return result.some((item) => item.teamId === targetId)
    }
  }
  // todo: 对方好友列表更新;群成员列表更新
  const handleUpdate = (id: number) => {
    if (id === 0) {
      nim
        .getFriendList()
        .then((list) => {
          logger.log('获取好友列表成功：', list)
          dispatch({
            type: 'setFriends',
            payload: list,
          })
        })
        .catch((err) => {
          logger.error('获取好友列表失败：', err)
        })
    } else if (id === 2) {
      nim
        .getTeams()
        .then((list) => {
          logger.log('获取群组列表成功：', list)
          dispatch({
            type: 'updateGroups',
            payload: list,
          })
        })
        .catch((err) => {
          logger.error('获取群组列表失败：', err)
        })
    }
  }
  const handleChat = async (id: number, account: string) => {
    let scene = 'p2p'
    let sessionId = `${scene}-${account}`
    if (id === 2 || id === 1) {
      scene = 'team'
      sessionId = `${scene}-${account}`
    }
    if (await nim.isSessionExist(sessionId)) {
      const session = await nim.getSession({ id: sessionId })
      dispatch({
        type: 'selectSession',
        payload: session,
      })
      logger.log('选中会话: ', session)
    } else {
      let tempSession: NimKitCoreTypes.ISession
      if (id === 0) {
        const friend = await nim.getUsersNameCardFromServer({
          accounts: [account],
        })
        tempSession = {
          ...friend[0],
          id: sessionId,
          scene: 'p2p',
          to: account,
          unread: 0,
          updateTime: Date.now(),
          createTime: Date.now(),
          isMute: false,
        }
      } else {
        const team = await nim.getTeamInfo({ teamId: account })
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
    }
    if (id === 2 || id === 0) {
      setAddModalVisible(false)
    } else {
      setCreateModalVisible(false)
    }
    onClickChat?.()
  }

  return (
    <div>
      <AddPanel trigger="click" onClick={onClick} prefix={prefix} />
      <AddModal
        visible={addModalVisible}
        onCancel={addModalOnCancel}
        title={title}
        handleOk={handleAddOk}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
      <CreateModal
        visible={createModalVisible}
        onCancel={createModalOnCancel}
        title={title}
        handleOk={handleCreateOk}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    </div>
  )
}
