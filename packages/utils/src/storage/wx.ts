import { StorageInterface } from './types'
class Storage implements StorageInterface {
  readonly store = new Map()
  readonly type: 'localStorage' | 'sessionStorage' | 'memory' = 'memory'
  readonly salt: string = '__salt__'

  constructor(
    type?: 'localStorage' | 'sessionStorage' | 'memory',
    salt?: string
  ) {
    type && (this.type = type)
    salt && (this.salt = salt)
  }

  public get(key: string): any {
    let value
    switch (this.type) {
      case 'memory':
        return this.store.get(key)
      case 'localStorage':
      case 'sessionStorage':
        value = wx.getStorageSync(`${this.salt}${key}`)
        return value
    }
  }

  public set(key: string, value: any) {
    switch (this.type) {
      case 'memory':
        this.store.set(key, value)
        break
      case 'localStorage':
      case 'sessionStorage':
        wx.setStorageSync(`${this.salt}${key}`, value)
        break
    }
  }

  public remove(key: string) {
    switch (this.type) {
      case 'memory':
        this.store.delete(key)
        break
      case 'localStorage':
      case 'sessionStorage':
        wx.removeStorageSync(`${this.salt}${key}`)
        break
    }
  }
}

export default Storage
