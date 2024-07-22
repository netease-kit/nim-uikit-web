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
import { V2NIMConst } from 'nim-web-sdk-ng'

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
      .filter((item) => item.accountId !== store.userStore.myUserInfo.accountId)

    const aiUsers = store.aiUserStore.getAIUserList()

    const datasource = useMemo(
      () =>
        teamMembers
          .filter((item) =>
            aiUsers.every((ai) => ai.accountId !== item.accountId)
          )
          .map((item) => ({
            key: item.accountId,
            label: store.uiStore.getAppellation({
              account: item.accountId,
              teamId: item.teamId,
            }),
          })),
      [aiUsers, store.uiStore, teamMembers]
    )

    const teamManagerAccounts = teamMembers
      .filter(
        (item) =>
          item.memberRole ===
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
      )
      .map((item) => item.accountId)

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
          (await store.teamStore.updateTeamMemberRoleActive({
            teamId,
            accounts: add,
            role: V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
          }))
        remove.length &&
          (await store.teamStore.updateTeamMemberRoleActive({
            teamId,
            accounts: remove,
            role: V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL,
          }))
        message.success(t('updateTeamManagerSuccessText'))
        onCancel()
      } catch (error: any) {
        switch (error?.code) {
          // 操作的人不在群中
          case 191004:
            message.error(t('userNotInTeam'))
            break
          // 没权限
          case 109432:
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
