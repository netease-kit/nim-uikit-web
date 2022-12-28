import { Utils } from '../../common-ui/src'
import packageJson from '../package.json'

export const logger = Utils.logDebug({
  level: 'debug',
  version: packageJson.version,
  appName: packageJson.name,
})
