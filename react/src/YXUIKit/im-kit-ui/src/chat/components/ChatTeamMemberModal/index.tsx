import React, { useCallback, useMemo } from 'react'
import { message } from 'antd'
import {
  useTranslation,
  useStateContext,
  ComplexAvatarContainer,
  SelectModal,
} from '../../../common'
import { observer } from 'mobx-react'
import { SelectModalItemProps } from '../../../common/components/SelectModal'

export interface ChatTeamMemberModalProps {
  visible: boolean
  onCancel: () => void
  teamId: string

  commonPrefix?: string
}

const ChatTeamMemberModal: React.FC<ChatTeamMemberModalProps> = observer(
  ({
    visible,
    onCancel,
    teamId,

    commonPrefix = 'common',
  }) => {
    const { t } = useTranslation()

    const { store, localOptions } = useStateContext()

    const teamMembers = store.teamMemberStore
      .getTeamMember(teamId)
      .filter((item) => item.account !== store.userStore.myUserInfo.account)

    const datasource = useMemo(
      () =>
        teamMembers.map((item) => ({
          key: item.account,
          label: store.uiStore.getAppellation({
            account: item.account,
            teamId: item.teamId,
          }),
        })),
      [store.uiStore, teamMembers]
    )

    const teamManagerAccounts = teamMembers
      .filter((item) => item.type === 'manager')
      .map((item) => item.account)

    const itemAvatarRender = useCallback(
      (data: SelectModalItemProps) => {
        return (
          <ComplexAvatarContainer
            account={data.key}
            canClick={false}
            prefix={commonPrefix}
            size={32}
          />
        )
      },
      [commonPrefix]
    )

    const handleOk = async (data: SelectModalItemProps[]) => {
      try {
        const add = data
          .filter((i) => teamManagerAccounts.every((j) => j !== i.key))
          .map((item) => item.key)
        const remove = teamManagerAccounts.filter((i) =>
          data.every((j) => j.key !== i)
        )
        add.length &&
          (await store.teamStore.addTeamManagersActive({
            teamId,
            accounts: add,
          }))
        remove.length &&
          (await store.teamStore.removeTeamManagersActive({
            teamId,
            accounts: remove,
          }))
        message.success(t('updateTeamManagerSuccessText'))
        onCancel()
      } catch (error: any) {
        switch (error?.code) {
          // 操作的人不在群中
          case 804:
            message.error(t('userNotInTeam'))
            break
          // 没权限
          case 802:
            message.error(t('noPermission'))
            break
          default:
            message.error(t('updateTeamManagerFailText'))
            break
        }
      }
    }

    return (
      <SelectModal
        title={t('teamManagerEditText')}
        visible={visible}
        datasource={datasource}
        itemAvatarRender={itemAvatarRender}
        defaultValue={teamManagerAccounts}
        type="checkbox"
        max={localOptions.teamManagerLimit}
        leftTitle={t('teamMemberText')}
        onOk={handleOk}
        onCancel={onCancel}
        prefix={commonPrefix}
      />
    )
  }
)

export default ChatTeamMemberModal
