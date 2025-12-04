import { useEffect } from 'react'
import { EventTracking } from '@xkit-yx/utils'
import { storeUtils } from '@xkit-yx/im-store-v2'

export interface UseEventTrackingProps {
  appkey: string
  version: string
  component: string
  imVersion: string
}

export const useEventTracking = ({
  appkey,
  version,
  component,
  imVersion,
}: UseEventTrackingProps): void => {
  useEffect(() => {
    const eventTracking = new EventTracking({
      appKey: appkey,
      version: version,
      component: component,
      imVersion: imVersion,
      platform: 'WEB',
      channel: 'netease',
      os: '',
      framework: 'React',
      language: storeUtils.detectLanguage(),
      container: 'PC',
    })

    eventTracking.track('init', '')
  }, [appkey, version, component, imVersion])
}
