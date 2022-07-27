import webRequestHelper from './web'
import wxRequestHelper from './wx'
import { RequestFn } from './types'

let requestHelper: RequestFn
if (process.env.PLATFORM === 'wx') {
  requestHelper = wxRequestHelper
} else if (process.env.PLATFORM === 'web') {
  requestHelper = webRequestHelper
}

export default requestHelper!
