import { useMemo } from 'react'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

interface ISessionInfo {
  nickName: string
  groupTitle: string
  teamId: string
}
function useCommonSessionInfo({ selectedSession, chatState }): ISessionInfo {
  const nickName = useMemo(() => {
    if (!selectedSession) return ''
    const { scene } = selectedSession
    if (scene === 'p2p') {
      const { nick, account } = selectedSession as NimKitCoreTypes.P2PSession
      return nick || account
    }
    if (scene === 'team') {
      const { name, teamId } = selectedSession as NimKitCoreTypes.TeamSession
      return name || teamId
    }
    return ''
  }, [selectedSession])

  const groupTitle = useMemo(() => {
    if (!selectedSession) return ''
    const { scene } = selectedSession as NimKitCoreTypes.TeamSession
    if (scene === 'team') {
      return `(${chatState.memberList.length}人)`
    }
    return ''
  }, [selectedSession, chatState.memberList])

  const teamId = useMemo(() => {
    if (!selectedSession) return ''
    const { scene, teamId } = selectedSession as NimKitCoreTypes.TeamSession
    if (scene === 'team') {
      return teamId
    }
    return ''
  }, [selectedSession])

  return {
    nickName,
    groupTitle,
    teamId,
  }
}

export default useCommonSessionInfo
