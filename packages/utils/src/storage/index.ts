import webStorage from './web'
import wxStorage from './wx'
let Storage: typeof webStorage
if (process.env.PLATFORM === 'wx') {
  Storage = wxStorage
} else {
  Storage = webStorage
}

export default Storage
