import React, { useMemo, useState } from 'react'
import { Switch, Select, Button, Empty } from 'antd'
import {
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../../common'
import {
  Team,
  TeamMember,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import ChatTeamMemberModal from '../ChatTeamMemberModal'
import { ALLOW_AT, TAllowAt } from '../../../constant'

export interface GroupPowerProps {
  onUpdateTeamInfo: (team: Partial<Team>) => void
  onTeamMuteChange: (mute: boolean) => void
  team: Team
  managers: TeamMember[]
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

  const ext: TAllowAt = useMemo(() => {
    let res = {}
    try {
      res = JSON.parse(team.ext || '{}')
    } catch (error) {
      //
    }
    return res
  }, [team.ext])

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
                  key={item.account}
                  account={item.account}
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
            value={team.updateTeamMode}
            onChange={(value) => {
              onUpdateTeamInfo({ updateTeamMode: value })
            }}
          ></Select>
        </div>
        <div className={`${_prefix}-who-item`}>
          <label>{t('teamInviteModeText')}</label>
          <Select
            className={`${_prefix}-who-select`}
            options={options}
            value={team.inviteMode}
            onChange={(value) => {
              onUpdateTeamInfo({ inviteMode: value })
            }}
          ></Select>
        </div>
        <div className={`${_prefix}-who-item`}>
          <label>{t('teamAtModeText')}</label>
          <Select
            className={`${_prefix}-who-select`}
            options={options}
            value={ext[ALLOW_AT] || 'all'}
            onChange={(value) => {
              onUpdateTeamInfo({
                ext: JSON.stringify({ ...ext, [ALLOW_AT]: value }),
              })
            }}
          ></Select>
        </div>
      </div>
      <div className={`${_prefix}-action`}>
        <div className={`${_prefix}-action-item`}>
          <label>{t('teamMuteText')}</label>
          <Switch checked={team.mute} onChange={onTeamMuteChange} />
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
