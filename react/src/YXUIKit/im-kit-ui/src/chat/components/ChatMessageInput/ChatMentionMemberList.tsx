import React, { useEffect, useState } from 'react'
import {
  CommonIcon,
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../../common'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { storeConstants } from '@xkit-yx/im-store'

export type MentionedMember = { account: string; appellation: string }

export interface ChatMentionMemberList {
  allowAtAll?: boolean
  prefix?: string
  commonPrefix?: string
  mentionMembers?: TeamMember[]
  onSelect?: (member: MentionedMember) => void
}

export const ChatAtMemberList: React.FC<ChatMentionMemberList> = observer(
  ({
    allowAtAll = true,
    prefix = 'chat',
    commonPrefix = 'common',
    mentionMembers,
    onSelect,
  }) => {
    const _prefix = `${prefix}-at-member`

    const { t } = useTranslation()

    const { store } = useStateContext()

    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
      if (mentionMembers) {
        setActiveIndex(0)
      }
    }, [mentionMembers])

    useEffect(() => {
      if (mentionMembers) {
        const maxIndex = mentionMembers.length - 1
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowUp') {
            const index = activeIndex - 1
            setActiveIndex(index < -1 ? maxIndex : index)
          } else if (e.key === 'ArrowDown') {
            const index = activeIndex + 1
            setActiveIndex(index > maxIndex ? -1 : index)
          } else if (e.key === 'Enter') {
            if (activeIndex === -1) {
              onSelect?.({
                account: storeConstants.AT_ALL_ACCOUNT,
                appellation: t('teamAll'),
              })
            } else {
              const member = mentionMembers[activeIndex]
              onSelect?.({
                account: member.account,
                appellation: store.uiStore.getAppellation({
                  account: member.account,
                  teamId: member.teamId,
                  ignoreAlias: true,
                }),
              })
            }
          }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => {
          document.removeEventListener('keydown', handleKeyDown)
        }
      }
    }, [activeIndex, mentionMembers, onSelect, t, store.uiStore])

    return (
      <div className={`${_prefix}-wrap`}>
        {allowAtAll && (
          <div
            className={classNames(`${_prefix}-item`, {
              [`${_prefix}-item-active`]: -1 === activeIndex,
            })}
            onClick={() =>
              onSelect?.({
                account: storeConstants.AT_ALL_ACCOUNT,
                appellation: t('teamAll'),
              })
            }
            onMouseEnter={() => setActiveIndex(-1)}
          >
            <div className={`${_prefix}-all-icon`}>
              <CommonIcon type="icon-team" />
            </div>
            <span className={`${_prefix}-label`}>{t('teamAll')}</span>
          </div>
        )}
        {mentionMembers?.map((member, index) => (
          <div
            className={classNames(`${_prefix}-item`, {
              [`${_prefix}-item-active`]: index === activeIndex,
            })}
            key={member.account}
            onClick={() => {
              onSelect?.({
                account: member.account,
                appellation: store.uiStore.getAppellation({
                  account: member.account,
                  teamId: member.teamId,
                  ignoreAlias: true,
                }),
              })
            }}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <ComplexAvatarContainer
              prefix={commonPrefix}
              canClick={false}
              size={28}
              account={member.account}
            />
            <span className={`${_prefix}-label`}>
              {store.uiStore.getAppellation({
                account: member.account,
                teamId: member.teamId,
              })}
            </span>
          </div>
        ))}
      </div>
    )
  }
)

export default ChatAtMemberList
