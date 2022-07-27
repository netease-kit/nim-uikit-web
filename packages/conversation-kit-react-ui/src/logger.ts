import { Utils } from '@xkit-yx/common-ui'
import packageJson from '../package.json'

export const logger = Utils.logDebug({
  level: 'debug',
  version: packageJson.version,
  appName: packageJson.name,
})
