import React, { FC, useEffect, useState } from 'react'
import { MsgList } from './components/MsgList'
import {
  useEventTracking,
  useStateContext,
  useTranslation,
} from '../../../common-ui/src'
import packageJson from '../../package.json'
import { observer } from 'mobx-react'
import { SystemMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SystemMessageServiceInterface'
import { message } from 'antd'
import { logger } from '../logger'

export interface MsgListContainerProps {
  /**
   自定义渲染消息中心为空时内容
   */
  renderMsgListEmpty?: () => JSX.Element
  /**
   自定义渲染消息中心头部内容
   */
  renderMsgListHeader?: () => JSX.Element
  /**
   点击发送消息后的事件
   */
  afterSendMsgClick?: () => void
  /**
   样式前缀
   */
  prefix?: string
  /**
   公共样式前缀
   */
  commonPrefix?: string
}

export const MsgListContainer: FC<MsgListContainerProps> = observer(
  ({
    renderMsgListHeader,
    renderMsgListEmpty,
    afterSendMsgClick,
    prefix = 'contact',
    commonPrefix = 'common',
  }) => {
    const { nim, store, initOptions } = useStateContext()

    const { t } = useTranslation()

    useEventTracking({
      appkey: initOptions.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: nim.version,
    })

    const [applyTeamLoaidng, setApplyTeamLoaidng] = useState(false)
    const [teamInviteLoading, setTeamInviteLoading] = useState(false)
    const [applyFriendLoading, setApplyFriendLoading] = useState(false)

    const onAcceptApplyTeamClick = (options: {
      teamId: string
      from: string
    }) => {
      setApplyTeamLoaidng(true)
      store.teamStore
        .passTeamApplyActive(options)
        .then(() => {
          message.success(t('acceptedText'))
        })
        .catch((err) => {
          message.error(t('acceptFailedText'))
          logger.error('同意该申请失败: ', err)
        })
        .finally(() => {
          setApplyTeamLoaidng(false)
        })
    }

    const onRejectApplyTeamClick = (options: {
      teamId: string
      from: string
    }) => {
      setApplyTeamLoaidng(true)
      store.teamStore
        .rejectTeamApplyActive(options)
        .then(() => {
          message.success(t('rejectedText'))
        })
        .catch((err) => {
          message.error(t('rejectFailedText'))
          logger.error('拒绝该申请失败: ', err)
        })
        .finally(() => {
          setApplyTeamLoaidng(false)
        })
    }

    const onAcceptTeamInviteClick = (options: {
      teamId: string
      from: string
    }) => {
      setTeamInviteLoading(true)
      store.teamStore
        .acceptTeamInviteActive(options)
        .then(() => {
          message.success(t('acceptedText'))
        })
        .catch((err) => {
          message.error(t('acceptFailedText'))
          logger.error('同意该申请失败: ', err)
        })
        .finally(() => {
          setTeamInviteLoading(false)
        })
    }

    const onRejectTeamInviteClick = (options: {
      teamId: string
      from: string
    }) => {
      setTeamInviteLoading(true)
      store.teamStore
        .rejectTeamInviteActive(options)
        .then(() => {
          message.success(t('rejectedText'))
        })
        .catch((err) => {
          message.error(t('rejectFailedText'))
          logger.error('拒绝该申请失败: ', err)
        })
        .finally(() => {
          setTeamInviteLoading(false)
        })
    }

    const onAcceptApplyFriendClick = (account: string) => {
      setApplyFriendLoading(true)
      store.friendStore
        .passFriendApplyActive(account)
        .then(() => {
          message.success(t('acceptedText'))
        })
        .catch((err) => {
          message.error(t('acceptFailedText'))
          logger.error('同意该申请失败: ', err)
        })
        .finally(() => {
          setApplyFriendLoading(false)
        })
    }

    const onRejectApplyFriendClick = (account: string) => {
      setApplyFriendLoading(true)
      store.friendStore
        .rejectFriendApplyActive(account)
        .then(() => {
          message.success(t('rejectedText'))
        })
        .catch((err) => {
          message.error(t('rejectFailedText'))
          logger.error('拒绝该申请失败: ', err)
        })
        .finally(() => {
          setApplyFriendLoading(false)
        })
    }

    return (
      <MsgList
        msgs={store.uiStore.applyMsgList}
        applyTeamLoaidng={applyTeamLoaidng}
        teamInviteLoading={teamInviteLoading}
        applyFriendLoading={applyFriendLoading}
        onAcceptApplyTeamClick={onAcceptApplyTeamClick}
        onRejectApplyTeamClick={onRejectApplyTeamClick}
        onAcceptTeamInviteClick={onAcceptTeamInviteClick}
        onRejectTeamInviteClick={onRejectTeamInviteClick}
        onAcceptApplyFriendClick={onAcceptApplyFriendClick}
        onRejectApplyFriendClick={onRejectApplyFriendClick}
        afterSendMsgClick={afterSendMsgClick}
        renderMsgListHeader={renderMsgListHeader}
        renderMsgListEmpty={renderMsgListEmpty}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    )
  }
)
