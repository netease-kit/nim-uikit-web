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
        value = localStorage.getItem(`${this.salt}${key}`)
        if (value) {
          return JSON.parse(value)
        }
        return value
      case 'sessionStorage':
        value = sessionStorage.getItem(`${this.salt}${key}`)
        if (value) {
          return JSON.parse(value)
        }
        return value
    }
  }

  public set(key: string, value: any) {
    switch (this.type) {
      case 'memory':
        this.store.set(key, value)
        break
      case 'localStorage':
        localStorage.setItem(`${this.salt}${key}`, JSON.stringify(value))
        break
      case 'sessionStorage':
        sessionStorage.setItem(`${this.salt}${key}`, JSON.stringify(value))
        break
    }
  }

  public remove(key: string) {
    switch (this.type) {
      case 'memory':
        this.store.delete(key)
        break
      case 'localStorage':
        localStorage.removeItem(`${this.salt}${key}`)
        break
      case 'sessionStorage':
        sessionStorage.removeItem(`${this.salt}${key}`)
        break
    }
  }
}

export default Storage
