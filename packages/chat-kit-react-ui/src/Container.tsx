import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { Modal } from 'antd'
import {
  Context,
  useTranslation,
  Welcome,
  useEventTracking,
} from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import ChatKit from './main'
import { message } from 'antd'
import { REEDIT_RECALL_MSG_TIME, MIN_VALUE, SCROLL_MSG_TYPE } from './constant'
import useCommonSessionInfo from './hooks/useCommonSessionInfo'
import useMemberListInfo from './hooks/useMemberListInfo'
import useSendMessageCallback from './hooks/useSendMessageCallback'
import useGetHistoryMsgs from './hooks/useGetHistoryMsgs'
import { logger } from './logger'
import * as ActionTypes from './contextManager/actionTypes'
import { ChatContext } from './contextManager/Provider'
import packageJson from '../package.json'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { ITeamInfo, IMessage, IMMessageInfo, ICustomMessageInfo } from './types'
import { IMessageCbProps } from './components/ChatMessageList'

const { confirm } = Modal

export interface ChatContainerProps {
  /**
   样式前缀
   */
  prefix?: string
  /**
    公共样式前缀
    */
  commonPrefix?: string
  /**
    外部选中的会话session
    */
  selectedSession?: NimKitCoreTypes.ISession
  /**
   自定义渲染未选中任何会话时的内容
   */
  renderWelcome?: () => JSX.Element
  /**
   自定义渲染聊天消息
   */
  renderCustomMessage?: (
    options: { msg: IMessage } & IMessageCbProps
  ) => JSX.Element
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  selectedSession,
  renderWelcome,
  renderCustomMessage,
}) => {
  const { nim, state, initOptions, dispatch } = useContext(Context)
  if (!nim || !state || !dispatch || !initOptions) {
    throw new Error('Please use Provider to wrap ChatKit.')
  }
  const { chatState, chatDispatch } = useContext(ChatContext)
  if (!chatState || !chatDispatch) {
    throw new Error('Please use ChatProvider to wrap ChatKit.')
  }

  const currentSession = state.selectedSession || selectedSession

  const { t } = useTranslation()

  useEventTracking({
    appkey: initOptions.appkey,
    version: packageJson.version,
    component: 'chat-kit',
    imVersion: nim.version,
  })

  const { nickName, groupTitle, teamId } = useCommonSessionInfo({
    selectedSession: currentSession,
    chatState,
  })

  useMemberListInfo({
    nim,
    selectedSession: currentSession,
    chatState,
    chatDispatch,
    dispatch,
    initOptions,
  })

  const {
    memberList,
    managers,
    teamInfo,
    msgLoading,
    msgNoData,
    messages,
    notExitTeamAccounts,
    notExitTeamAccountsInfo,
    uploadImageLoading,
    uploadFileLoading,
  } = chatState

  const [selectedAddMembersList, setSelectedAddMembersList] = useState<
    NimKitCoreTypes.IFriendInfo[]
  >([])
  const [selectedCreateTeamMembersList, setSelectedCreateTeamMembersList] =
    useState<NimKitCoreTypes.IFriendInfo[]>([])
  const [groupAddMembersVisible, setGroupAddMembersVisible] =
    useState<boolean>(false)
  const [groupCreateVisible, setGroupCreateVisible] = useState<boolean>(false)
  const [settingBarVisible, setSettingBarVisible] = useState<boolean>(false)
  const [action, setAction] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')
  const [currentActionIndex, setCurrentActionIndex] =
    useState<number>(MIN_VALUE)
  const [scrollMsgType, setScrollMsgType] = useState<string>(
    SCROLL_MSG_TYPE.send
  )
  const [chatMsgPos, setChatMsgPos] = useState<number>(0)

  const { onSendHandler, onResendHandler } = useSendMessageCallback(
    { setScrollMsgType, setInputValue },
    {
      nim,
      chatDispatch,
      ActionTypes,
    }
  )

  const getHistoryMsgs = useGetHistoryMsgs(
    { currentSession, setScrollMsgType, teamId },
    { nim, chatDispatch, ActionTypes }
  )

  useEffect(() => {
    if (!(messages.length && memberList.length)) {
      return
    }
    const fromKey = 'from'
    const key = 'account'
    const map = new Map<string, Partial<NimKitCoreTypes.ITeamMemberInfo>>()
    memberList.map((item) => {
      item[key] && map.set(item[key], item)
    })

    const accounts: string[] = []
    messages.forEach((item) => {
      const account = item[fromKey] as string
      const exist = map.get(account)
      if (!exist) {
        account && !accounts.includes(account) && accounts.push(account)
      }
    })

    chatDispatch({
      type: ActionTypes.UPDATE_NOT_EXIT_TEAM_ACCOUNTS,
      payload: accounts,
    })
  }, [messages, memberList, chatDispatch])

  useEffect(() => {
    if (!notExitTeamAccounts.length) {
      return
    }
    nim
      .getUsersNameCardFromServer({ accounts: notExitTeamAccounts })
      .then((list) => {
        chatDispatch({
          type: ActionTypes.UPDATE_NOT_EXIT_TEAM_ACCOUNTS_INFO,
          payload: list,
        })
      })
      .catch(() => {
        logger.error('获取不在群中的成员信息失败!')
      })
  }, [notExitTeamAccounts, nim, chatDispatch])

  const messageList = useMemo(() => {
    if (!(messages.length && memberList.length)) {
      return []
    }
    const fromKey = 'from'
    const key = 'account'
    const map = new Map<string, Partial<NimKitCoreTypes.ITeamMemberInfo>>()
    memberList.map((item) => {
      item[key] && map.set(item[key], item)
    })
    return messages.map((msg) => {
      if ((msg as ICustomMessageInfo).specialType) {
        return msg
      }
      const exist = map.get(msg[fromKey] as string)
      if (exist) {
        const { nick, avatar, signature, gender, email, birth, tel } = exist
        return {
          ...msg,
          nick,
          avatar,
          signature,
          gender,
          email,
          birth,
          tel,
        } as IMMessageInfo
      }
      return {
        ...msg,
        ...(notExitTeamAccountsInfo.find(
          (cardInfo) => cardInfo.account === msg[fromKey]
        ) || {}),
      } as IMMessageInfo
    })
  }, [messages, memberList, notExitTeamAccountsInfo])

  const resetSettingAction = useCallback(() => {
    setSettingBarVisible(false)
    setCurrentActionIndex(MIN_VALUE)
    setAction('')
  }, [])

  const createTeamSuccessHandler = useCallback(
    (team, isSelected) => {
      const { teamId } = team
      const scene = 'team'
      const sessionId = `${scene}-${teamId}`
      const tempSession: NimKitCoreTypes.ISession = {
        ...team,
        id: sessionId,
        scene,
        to: teamId,
        unread: 0,
        updateTime: Date.now(),
        createTime: Date.now(),
        mute: false,
      }
      dispatch({
        type: 'insertTempSession',
        payload: {
          isSelected: isSelected,
          session: tempSession,
        },
      })
    },
    [dispatch]
  )

  const onGroupCreateHandler = useCallback(
    (formValues) => {
      const { name, avatar } = formValues
      if (!selectedCreateTeamMembersList.length) {
        return message.error(t('addTeamMemberConfirmText'))
      }
      const accounts = selectedCreateTeamMembersList
        .map((item) => item.account)
        .concat(initOptions.account, currentSession?.to as string)
      // normal 为普通群（讨论组） advanced 为 高级群
      nim
        .createTeam({
          accounts,
          avatar,
          type: 'advanced',
          joinMode: 'noVerify',
          beInviteMode: 'noVerify',
          inviteMode: 'all',
          updateTeamMode: 'manager',
          updateExtMode: 'manager',
          name,
        })
        .then((team) => {
          createTeamSuccessHandler(team, true)
          setGroupCreateVisible(false)
          resetSettingAction()
          message.success(t('createTeamSuccessText'))
          logger.log('群创建成功')
        })
        .catch((error) => {
          message.error(t('createTeamFailedText'))
          logger.error('群创建失败', error)
        })
    },
    [
      createTeamSuccessHandler,
      nim,
      initOptions.account,
      currentSession?.to,
      selectedCreateTeamMembersList,
      resetSettingAction,
      t,
    ]
  )

  const onGroupAddMembersHandler = () => {
    if (!selectedAddMembersList.length) {
      return message.error(t('addTeamMemberConfirmText'))
    }
    const curAccounts = memberList.map((item) => item.account)
    const accounts = selectedAddMembersList
      .filter((item) => !curAccounts.includes(item.account))
      .map((item) => item.account)

    if (!accounts.length) {
      setGroupAddMembersVisible(false)
      setGroupCreateVisible(false)
      setSelectedAddMembersList([])
      return
    }
    nim
      .addTeamMembers({
        teamId,
        accounts,
      })
      .then(() => {
        setGroupAddMembersVisible(false)
        setGroupCreateVisible(false)
        logger.log('添加成员成功')
      })
      .catch((error) => {
        message.error(t('addTeamMemberFailedText'))
        logger.error('添加成员失败', error)
      })
  }

  const onRemoveTeamMemberHandler = (memberInfo) => {
    const { account, nick, nickInTeam } = memberInfo
    nim
      .removeTeamMembers({
        teamId,
        accounts: [account],
      })
      .then(() => {
        logger.log(`${nickInTeam || nick}已被移除群聊`)
      })
      .catch((error) => {
        message.error(t('removeTeamMemberFailedText'))
        logger.error('移除成员失败', error)
      })
  }

  const onDismissTeamHandler = () => {
    nim
      .dismissTeam({
        teamId,
      })
      .then(() => {
        resetSettingAction()
        logger.log('群解散成功')
      })
      .catch((error) => {
        message.error(t('dismissTeamFailedText'))
        logger.error('群解散失败', error)
      })
  }

  const onLeaveTeamHandler = () => {
    nim
      .leaveTeam({
        teamId,
      })
      .then(() => {
        message.success(t('leaveTeamSuccessText'))
        logger.log('已成功退出此群')
        resetSettingAction()
        dispatch({
          type: 'deleteSessions',
          payload: [(currentSession as NimKitCoreTypes.ISession).id],
        })
        chatDispatch({
          type: ActionTypes.CLEAR_SELECTED_GROUP_INFO,
          payload: {},
        })
      })
      .catch((error) => {
        message.error(t('leaveTeamFailedText'))
        logger.error('退出此群失败', error)
      })
  }

  const onUpdateTeamInfoSubmitHandler = (formValues) => {
    nim
      .updateTeamInfo({
        teamId,
        ...formValues,
      })
      .then(() => {
        message.success(t('updateTeamSuccessText'))
        logger.log('修改成功')
      })
      .catch((error) => {
        message.error(t('updateTeamFailedText'))
        logger.error('修改失败', error)
      })
  }

  const onUpdateTeamPowerInfoHanlder = (type, checked) => {
    switch (type) {
      case 'updateTeamMode':
        {
          onUpdateTeamInfoSubmitHandler({
            updateTeamMode: checked ? 'manager' : 'all',
          })
        }
        break
      case 'muteMode': {
        nim
          .muteTeam({
            teamId,
            mute: checked,
          })
          .then(() => {
            message.success(
              checked ? t('muteAllTeamText') : t('unmuteAllTeamText')
            )
            logger.log(`${checked ? '开启' : '结束'}全员禁言成功`)
            chatDispatch({
              type: ActionTypes.UPDATE_SELECTED_GROUP_INFO,
              payload: {
                ...teamInfo,
                mute: checked,
              },
            })
          })
          .catch((error) => {
            message.error(t('muteAllTeamFailedText'))
            logger.error('禁言失败', error)
          })
      }
    }
  }

  useEffect(() => {
    if (!currentSession) {
      return
    }
    chatDispatch({
      type: ActionTypes.CLEAR_MESSAGES,
      payload: undefined,
    })
    chatDispatch({
      type: ActionTypes.CLEAR_SELECTED_GROUP_INFO,
      payload: {},
    })
    chatDispatch({
      type: ActionTypes.UPDATE_MSG_NO_DATA,
      payload: false,
    })
    resetSettingAction()
    setChatMsgPos(0)
    getHistoryMsgs()
  }, [currentSession?.id, chatDispatch, getHistoryMsgs])

  useEffect(() => {
    if (!currentSession) {
      return
    }
    const { scene } = currentSession as NimKitCoreTypes.ISession
    if (scene !== 'team' || !memberList.length) {
      return
    }

    nim
      .getTeams()
      .then((list) => {
        logger.log('获取群组列表成功：', list)
        const updateTeamInfo = list.find((item) => item.teamId === teamId)
        if (updateTeamInfo) {
          chatDispatch({
            type: ActionTypes.UPDATE_SELECTED_GROUP_INFO,
            payload: updateTeamInfo as ITeamInfo,
          })
        }
      })
      .catch((err) => {
        logger.error('获取群组列表失败：', err)
      })
  }, [currentSession, chatDispatch, dispatch, nim, memberList, teamId])

  useEffect(() => {
    const onRemoveTeamMembers = (params) => {
      const { accounts } = params
      const { account } = initOptions
      if (!accounts.includes(account)) {
        const rmMemebers = memberList.filter((item) =>
          accounts.includes(item.account)
        )
        const rmNames = rmMemebers.map((item) => item.nickInTeam || item.nick)
        rmNames.length &&
          message.info(`${rmNames.join('，')}${t('leaveTeamText')}`)
      }
      chatDispatch({
        type: ActionTypes.DELETE_MEMBERS_LIST,
        payload: accounts,
      })
    }
    nim.on('removeTeamMembers', onRemoveTeamMembers)
    return () => {
      nim.off('removeTeamMembers', onRemoveTeamMembers)
    }
  }, [chatDispatch, nim, memberList, initOptions, t])

  useEffect(() => {
    if (!state.myUserInfo) {
      return
    }
    chatDispatch({
      type: ActionTypes.UPDATE_MEMBERS_LIST,
      payload: state.myUserInfo,
    })
  }, [state.myUserInfo, chatDispatch])

  useEffect(() => {
    const onUpdateMyNameCard = (payload) => {
      dispatch({
        type: 'updateMyUserInfo',
        payload,
      })
      chatDispatch({
        type: ActionTypes.UPDATE_MEMBERS_LIST,
        payload,
      })
    }

    const onDismissTeam = () => {
      chatDispatch({
        type: ActionTypes.CLEAR_SELECTED_GROUP_INFO,
        payload: {},
      })
    }

    nim.on('updateMyNameCard', onUpdateMyNameCard)
    nim.on('dismissTeam', onDismissTeam)
    return () => {
      nim.off('updateMyNameCard', onUpdateMyNameCard)
      nim.off('dismissTeam', onDismissTeam)
    }
  }, [chatDispatch, dispatch, nim])

  useEffect(() => {
    const onMsg = async (msg: IMMessage) => {
      if ((currentSession as NimKitCoreTypes.ISession)?.to === msg.target) {
        setScrollMsgType(SCROLL_MSG_TYPE.receive)
        chatDispatch({
          type: ActionTypes.ADD_MESSAGES,
          payload: [msg],
        })
      }
    }

    const onCreateTeam = (team) => {
      createTeamSuccessHandler(team, false)
    }

    nim.on('msg', onMsg)
    nim.on('createTeam', onCreateTeam)

    return () => {
      nim.off('msg', onMsg)
      nim.off('createTeam', onCreateTeam)
    }
  }, [currentSession, chatDispatch, nim, createTeamSuccessHandler])

  useEffect(() => {
    const onUpdateTeam = (params) => {
      const newSelectedSession = {
        ...currentSession,
        ...params,
      }
      dispatch({
        type: 'updateSessions',
        payload: [newSelectedSession],
      })
      chatDispatch({
        type: ActionTypes.UPDATE_SELECTED_GROUP_INFO,
        payload: {
          ...teamInfo,
          ...params,
        },
      })
    }

    nim.on('updateTeam', onUpdateTeam)
    return () => {
      nim.off('updateTeam', onUpdateTeam)
    }
  }, [currentSession, teamInfo, dispatch, chatDispatch, nim])

  useEffect(() => {
    const onAddTeamMembers = () => {
      if (!teamInfo) {
        return
      }
      if (!selectedAddMembersList.length) {
        return
      }
      message.info(
        `${selectedAddMembersList
          .map((item) => `【${item.nick}】`)
          .join('，')}${t('enterTeamText')}`
      )
      chatDispatch({
        type: ActionTypes.ADD_MEMBERS_LIST,
        payload: selectedAddMembersList.map((item) => {
          return {
            ...teamInfo,
            ...item,
            avatar: item.avatar || '',
          }
        }),
      })
      setSelectedAddMembersList([])
    }

    nim.on('addTeamMembers', onAddTeamMembers)
    return () => {
      nim.off('addTeamMembers', onAddTeamMembers)
    }
  }, [teamInfo, selectedAddMembersList, nim, chatDispatch, memberList, t])

  useEffect(() => {
    const onSysMsg = (params) => {
      const { type } = params
      switch (type) {
        case 'deleteMsgP2pOneWay':
        case 'deleteMsgTeamOneWay':
          break
        case 'recallMsgP2p':
        case 'recallMsgTeam':
        case 'recallMsgSuperTeam': {
          const { from } = params
          const {
            idClient,
            fromNick = '',
            opeAccount,
          } = params.recallMessageInfo
          const account = opeAccount || from

          chatDispatch({
            type: ActionTypes.DELETE_MESSAGES,
            payload: [idClient],
          })
          // 暂时使用兜底逻辑，判断当前消息列表中是否有此撤回的消息id来决定渲染
          if (messages.find((item) => item.idClient === idClient)) {
            chatDispatch({
              type: ActionTypes.ADD_MESSAGES,
              payload: [
                {
                  from: account,
                  specialType: 'recall',
                  idClient,
                  fromNick,
                },
              ],
            })
          }
        }
      }
    }

    nim.on('sysMsg', onSysMsg)

    return () => {
      nim.off('sysMsg', onSysMsg)
    }
  }, [chatDispatch, nim, messages])

  useEffect(() => {
    if (!memberList.length) {
      return
    }
    chatDispatch({
      type: ActionTypes.ADD_TEAM_MANAGERS,
      payload: memberList
        .filter((item) => item.type === 'manager')
        .map((item) => item.account),
    })
  }, [memberList, chatDispatch])

  const isGroupOwner = useMemo(() => {
    if (!teamInfo) {
      return false
    }
    const { owner } = teamInfo

    return initOptions.account === owner
  }, [teamInfo, initOptions.account])

  const isGroupManager = useMemo(() => {
    if (!managers.length) {
      return false
    }
    return managers.includes(initOptions.account)
  }, [managers, initOptions.account])

  const placeholder = useMemo(() => {
    if (!teamInfo) {
      return ''
    }
    // 后续还有禁言类型
    const { mute } = teamInfo
    if (isGroupOwner || isGroupManager || !mute) {
      return `${t('sendToText')} ${nickName}${t('sendUsageText')}`
    }
    return t('teamMutePlaceholder')
  }, [teamInfo, isGroupOwner, isGroupManager, nickName, t])

  const onSetInputValueHandler = useCallback((value) => {
    setInputValue(value)
  }, [])

  const showReeditMsgBtnHandler = (msg) => {
    const { idClient, type, body } = msg
    const recallMsgIdClient = Date.now() + idClient
    const { account } = initOptions
    const payload: ICustomMessageInfo = {
      from: account,
      idClient: recallMsgIdClient,
      type,
      body,
      specialType: 'reedit',
    }

    if (!['text', 'custom'].includes(type)) {
      payload.specialType = 'recall'
      return payload
    }

    setTimeout(() => {
      payload.specialType = 'recall'
      chatDispatch({
        type: ActionTypes.UPDATE_MESSAGES,
        payload,
      })
    }, REEDIT_RECALL_MSG_TIME)
    return payload
  }

  const onMessageActionHandler = async (action: string, msg: IMMessageInfo) => {
    setScrollMsgType(action)
    switch (action) {
      case 'recall':
        {
          const recallMsg = await nim.recallMsg({
            ps: 'recall msg',
            msg,
          })
          chatDispatch({
            type: ActionTypes.DELETE_MESSAGES,
            payload: [recallMsg.idClient],
          })

          const finMsg = showReeditMsgBtnHandler(recallMsg)
          chatDispatch({
            type: ActionTypes.ADD_MESSAGES,
            payload: [finMsg],
          })
        }
        break

      case 'delete': {
        confirm({
          content: t('confirmDeleteText'),
          okText: t('deleteText'),
          cancelText: t('cancelText'),
          okType: 'danger',
          onOk: async () => {
            const deleteMsgArrs = await nim.deleteSelfMsgs({
              msgs: [msg],
            })
            chatDispatch({
              type: ActionTypes.DELETE_MESSAGES,
              payload: deleteMsgArrs.map((item) => item.idClient),
            })
          },
        })
      }
    }
  }

  return (
    <>
      {currentSession ? (
        <ChatKit
          prefix={prefix}
          commonPrefix={commonPrefix}
          headerTitle={nickName}
          headerSubTitle={groupTitle}
          placeholder={placeholder}
          memberList={memberList}
          onSend={onSendHandler}
          onResend={onResendHandler}
          onChange={onSetInputValueHandler}
          onReeditClick={onSetInputValueHandler}
          selectedSession={currentSession}
          teamInfo={teamInfo}
          myUserInfo={state.myUserInfo}
          msgLoading={msgLoading}
          msgNoData={msgNoData}
          uploadImageLoading={uploadImageLoading}
          uploadFileLoading={uploadFileLoading}
          messages={messageList}
          scrollMsgType={scrollMsgType}
          initOptions={initOptions}
          inputValue={inputValue}
          groupCreateVisible={groupCreateVisible}
          setGroupCreateVisible={setGroupCreateVisible}
          groupAddMembersVisible={groupAddMembersVisible}
          setGroupAddMembersVisible={setGroupAddMembersVisible}
          onGroupAddMembers={onGroupAddMembersHandler}
          onGroupCreate={onGroupCreateHandler}
          onDismissTeam={onDismissTeamHandler}
          onLeaveTeam={onLeaveTeamHandler}
          onMessageAction={onMessageActionHandler}
          selectedAddMembersList={selectedAddMembersList.map(
            (item) => item.account
          )}
          setSelectedAddMembersList={setSelectedAddMembersList}
          selectedCreateTeamMembersList={selectedCreateTeamMembersList.map(
            (item) => item.account
          )}
          setSelectedCreateTeamMembersList={setSelectedCreateTeamMembersList}
          onRemoveTeamMemberClick={onRemoveTeamMemberHandler}
          resetSettingAction={resetSettingAction}
          settingBarVisible={settingBarVisible}
          setSettingBarVisible={setSettingBarVisible}
          currentActionIndex={currentActionIndex}
          setCurrentActionIndex={setCurrentActionIndex}
          action={action}
          setAction={setAction}
          isGroupOwner={isGroupOwner}
          isGroupManager={isGroupManager}
          onUpdateTeamInfoSubmit={onUpdateTeamInfoSubmitHandler}
          onUpdateTeamPowerInfo={onUpdateTeamPowerInfoHanlder}
          chatMsgPos={chatMsgPos}
          setChatMsgPos={setChatMsgPos}
          getHistoryMsgs={getHistoryMsgs}
          renderCustomMessage={renderCustomMessage}
        />
      ) : renderWelcome ? (
        renderWelcome()
      ) : (
        <Welcome prefix={commonPrefix} />
      )}
    </>
  )
}
