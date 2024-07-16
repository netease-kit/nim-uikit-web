import React, { useMemo, useState } from 'react'
import { Switch, Select, Button, Empty } from 'antd'
import {
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../../common'
import {
  V2NIMTeam,
  V2NIMTeamMember,
  V2NIMUpdatedTeamInfo,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService'
import ChatTeamMemberModal from '../ChatTeamMemberModal'
import { V2NIMConst } from 'nim-web-sdk-ng'
import { YxServerExt } from '@xkit-yx/im-store-v2/dist/types/types'

export interface GroupPowerProps {
  onUpdateTeamInfo: (team: V2NIMUpdatedTeamInfo) => void
  onTeamMuteChange: (mute: boolean) => void
  team: V2NIMTeam
  managers: V2NIMTeamMember[]
  isGroupOwner: boolean
  afterSendMsgClick?: () => void

  prefix?: string
  commonPrefix?: string
}

const GroupPower: React.FC<GroupPowerProps> = ({
  onUpdateTeamInfo,
  onTeamMuteChange,
  team,
  managers,
  isGroupOwner,
  afterSendMsgClick,

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const { localOptions } = useStateContext()
  const { t } = useTranslation()
  const _prefix = `${prefix}-group-power`

  const [memberModalVisible, setMemberModalVisible] = useState(false)

  const options = useMemo(() => {
    return [
      {
        label: localOptions.teamManagerVisible
          ? t('teamOwnerAndManagerText')
          : t('teamOwnerText'),
        value: 'manager',
      },
      {
        label: t('teamAll'),
        value: 'all',
      },
    ]
  }, [localOptions.teamManagerVisible, t])

  const ext: YxServerExt = useMemo(() => {
    let res = {}

    try {
      res = JSON.parse(team.serverExtension || '{}')
    } catch (error) {
      //
    }

    return res
  }, [team.serverExtension])

  return (
    <div className={`${_prefix}-wrap`}>
      {localOptions.teamManagerVisible && (
        <div className={`${_prefix}-manager`}>
          <div className={`${_prefix}-manager-title`}>
            <label>{t('teamManagerText')}</label>
            {isGroupOwner && (
              <Button
                onClick={() => {
                  setMemberModalVisible(true)
                }}
                className={`${_prefix}-manager-btn`}
                type="link"
              >
                {t('teamManagerEditText') + ' >'}
              </Button>
            )}
          </div>
          <div className={`${_prefix}-manager-avatars`}>
            {!managers.length ? (
              <Empty
                className={`${_prefix}-manager-avatars-empty`}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('teamManagerEmptyText')}
              />
            ) : (
              managers.map((item) => (
                <ComplexAvatarContainer
                  key={item.accountId}
                  account={item.accountId}
                  afterSendMsgClick={afterSendMsgClick}
                  prefix={commonPrefix}
                />
              ))
            )}
          </div>
        </div>
      )}
      <div className={`${_prefix}-who`}>
        <div className={`${_prefix}-who-item`}>
          <label>{t('teamManagerLimitText')}</label>
          <Select
            className={`${_prefix}-who-select`}
            options={options}
            value={
              team.updateInfoMode ===
              V2NIMConst.V2NIMTeamUpdateInfoMode
                .V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER
                ? 'manager'
                : 'all'
            }
            onChange={(value) => {
              onUpdateTeamInfo({
                updateInfoMode:
                  value === 'manager'
                    ? V2NIMConst.V2NIMTeamUpdateInfoMode
                        .V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER
                    : V2NIMConst.V2NIMTeamUpdateInfoMode
                        .V2NIM_TEAM_UPDATE_INFO_MODE_ALL,
              })
            }}
          ></Select>
        </div>
        <div className={`${_prefix}-who-item`}>
          <label>{t('teamInviteModeText')}</label>
          <Select
            className={`${_prefix}-who-select`}
            options={options}
            value={
              team.inviteMode ===
              V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER
                ? 'manager'
                : 'all'
            }
            onChange={(value) => {
              onUpdateTeamInfo({
                inviteMode:
                  value === 'manager'
                    ? V2NIMConst.V2NIMTeamInviteMode
                        .V2NIM_TEAM_INVITE_MODE_MANAGER
                    : V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL,
              })
            }}
          ></Select>
        </div>
        <div className={`${_prefix}-who-item`}>
          <label>{t('teamAtModeText')}</label>
          <Select
            className={`${_prefix}-who-select`}
            options={options}
            value={ext.yxAllowAt || 'all'}
            onChange={(value) => {
              onUpdateTeamInfo({
                serverExtension: JSON.stringify({
                  ...ext,
                  yxAllowAt: value,
                } as YxServerExt),
              })
            }}
          ></Select>
        </div>
        <div className={`${_prefix}-who-item`}>
          <label>{t('teamTopModeText')}</label>
          <Select
            className={`${_prefix}-who-select`}
            options={options}
            value={ext.yxAllowTop || 'manager'}
            onChange={(value) => {
              const newExt: YxServerExt = {
                ...ext,
                yxAllowTop: value,
                lastOpt: 'yxAllowTop',
              }

              onUpdateTeamInfo({
                serverExtension: JSON.stringify(newExt),
                // 为了兼容老数据，修改该权限时需要将 updateExtensionMode 修改为所有人
                updateExtensionMode:
                  V2NIMConst.V2NIMTeamUpdateExtensionMode
                    .V2NIM_TEAM_UPDATE_EXTENSION_MODE_ALL,
              })
            }}
          ></Select>
        </div>
      </div>
      <div className={`${_prefix}-action`}>
        <div className={`${_prefix}-action-item`}>
          <label>{t('teamMuteText')}</label>
          <Switch
            checked={
              team.chatBannedMode !==
              V2NIMConst.V2NIMTeamChatBannedMode
                .V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
            }
            onChange={onTeamMuteChange}
          />
        </div>
      </div>
      <ChatTeamMemberModal
        visible={memberModalVisible}
        onCancel={() => {
          setMemberModalVisible(false)
        }}
        teamId={team.teamId}
        commonPrefix={commonPrefix}
      />
      {/* <Form>
        <Form.Item name="updateTeamMode" label={t('teamManagerLimitText')}>
          <Switch
            checked={team.updateTeamMode === 'manager'}
            disabled={!hasPower}
            onChange={(checked) => {
              onUpdateTeamInfo({ updateTeamMode: checked ? 'manager' : 'all' })
            }}
          />
        </Form.Item>
        <Form.Item name="mute" label={t('teamMuteText')}>
          <Switch
            checked={team.mute}
            disabled={!hasPower}
            onChange={onTeamMuteChange}
          />
        </Form.Item>
        <Form.Item name="inviteMode" label={t('teamInviteModeText')}>
          <Switch
            checked={team.inviteMode === 'manager'}
            disabled={!hasPower}
            onChange={(checked) => {
              onUpdateTeamInfo({ inviteMode: checked ? 'manager' : 'all' })
            }}
          />
        </Form.Item>
      </Form> */}
    </div>
  )
}

export default GroupPower
