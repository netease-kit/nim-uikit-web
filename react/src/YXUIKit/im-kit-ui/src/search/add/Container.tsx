import React, { useState } from 'react'
import { useStateContext, useEventTracking } from '../../common'
import AddPanel from './components/AddPanel'
import AddFriendModal from './components/AddFriendModal'
import JoinTeamModal from './components/JoinTeamModal'
import CreateModal from './components/CreateModal'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'
import sdkPkg from 'nim-web-sdk-ng/package.json'

export type PanelScene = 'addFriend' | 'joinTeam' | 'createTeam'

export interface AddContainerProps {
  /**
   点击去聊天回调，id 为 account 或者 teamId
   */
  onClickChat?: (id: string) => void

  /**
   样式前缀
   */
  prefix?: string

  /**
   公共样式前缀
   */
  commonPrefix?: string
}

export const AddContainer: React.FC<AddContainerProps> = observer(
  ({ onClickChat, prefix = 'search', commonPrefix = 'common' }) => {
    const { nim } = useStateContext()

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'SearchUIKit',
      imVersion: sdkPkg.version,
    })

    const [addFriendModalVisible, setAddFriendModalVisible] = useState(false)
    const [joinTeamModalVisible, setJoinTeamModalVisible] = useState(false)
    const [createModalVisible, setCreateModalVisible] = useState(false)

    const handleChangeScene = (scene: PanelScene, visible: boolean) => {
      switch (scene) {
        case 'addFriend':
          setAddFriendModalVisible(visible)
          break
        case 'createTeam':
          setCreateModalVisible(visible)
          break
        case 'joinTeam':
          setJoinTeamModalVisible(visible)
        default:
          break
      }
    }

    const handleChat = (scene: PanelScene, id: string) => {
      handleChangeScene(scene, false)
      onClickChat?.(id)
    }

    return (
      <div>
        <AddPanel
          trigger="click"
          onClick={(scene) => {
            handleChangeScene(scene, true)
          }}
          prefix={prefix}
        />
        <AddFriendModal
          visible={addFriendModalVisible}
          onCancel={() => {
            setAddFriendModalVisible(false)
          }}
          onChat={handleChat.bind(null, 'addFriend')}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
        <JoinTeamModal
          visible={joinTeamModalVisible}
          onCancel={() => {
            setJoinTeamModalVisible(false)
          }}
          onChat={handleChat.bind(null, 'joinTeam')}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
        <CreateModal
          visible={createModalVisible}
          onCancel={() => {
            setCreateModalVisible(false)
          }}
          onChat={handleChat.bind(null, 'createTeam')}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
      </div>
    )
  }
)
