import request from '../request'

const url = `https://statistic.live.126.net/statics/report/xkit/action`

interface IEventTracking {
  appKey: string
  version: string
  component: string
  nertcVersion?: string
  imVersion?: string
}

class EventTracking {
  appKey: string
  version: string
  component: string
  nertcVersion?: string
  imVersion?: string
  constructor({
    appKey,
    version,
    component,
    nertcVersion,
    imVersion,
  }: IEventTracking) {
    this.appKey = appKey
    this.version = version
    this.component = component
    this.nertcVersion = nertcVersion
    this.imVersion = imVersion
  }
  track(reportType: string, data: any) {
    const { appKey, version, component, nertcVersion, imVersion } = this
    const timeStamp = Date.now()
    return request({
      method: 'POST',
      url,
      data: {
        appKey,
        version,
        component,
        timeStamp,
        nertcVersion,
        imVersion,
        reportType,
        data,
      },
    })
  }
}

export default EventTracking
