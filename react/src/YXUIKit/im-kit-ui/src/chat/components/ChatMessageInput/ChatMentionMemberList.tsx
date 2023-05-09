import React, { useEffect, useState } from 'react'
import {
  CommonIcon,
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../../common'
import { FriendProfile, TeamMember } from '@xkit-yx/im-store'
import classNames from 'classnames'

type Member = TeamMember & Partial<FriendProfile>
export type MentionedMember = Pick<Member, 'account' | 'nickInTeam'>

export interface ChatMentionMemberList {
  prefix?: string
  commonPrefix?: string
  mentionMembers?: Member[]
  onSelect?: (member: MentionedMember) => void
}

export const ChatAtMemberList: React.FC<ChatMentionMemberList> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  mentionMembers,
  onSelect,
}) => {
  const _prefix = `${prefix}-at-member`

  const { t } = useTranslation()

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
              account: 'ait_all',
              nickInTeam: t('teamAll'),
            })
          } else {
            onSelect?.(mentionMembers[activeIndex])
          }
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [activeIndex, mentionMembers, onSelect, t])

  return (
    <div className={`${_prefix}-wrap`}>
      <div
        className={classNames(`${_prefix}-item`, {
          [`${_prefix}-item-active`]: -1 === activeIndex,
        })}
        onClick={() =>
          onSelect?.({
            account: 'ait_all',
            nickInTeam: t('teamAll'),
          })
        }
        onMouseEnter={() => setActiveIndex(-1)}
      >
        <div className={`${_prefix}-all-icon`}>
          <CommonIcon type="icon-team" />
        </div>
        <span className={`${_prefix}-label`}>{t('teamAll')}</span>
      </div>
      {mentionMembers?.map((member, index) => (
        <div
          className={classNames(`${_prefix}-item`, {
            [`${_prefix}-item-active`]: index === activeIndex,
          })}
          key={member.account}
          onClick={() => {
            onSelect?.(member)
          }}
          onMouseEnter={() => setActiveIndex(index)}
        >
          <ComplexAvatarContainer
            prefix={commonPrefix}
            canClick={false}
            size={28}
            account={member.account}
          />
          <span className={`${_prefix}-label`}>{member.alias}</span>
        </div>
      ))}
    </div>
  )
}

export default ChatAtMemberList
