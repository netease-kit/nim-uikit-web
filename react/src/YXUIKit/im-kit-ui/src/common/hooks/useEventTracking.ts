import { useEffect } from 'react'
import { EventTracking } from '@xkit-yx/utils'

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
    })
    eventTracking.track('init', '')
  }, [appkey, version, component, imVersion])
}
