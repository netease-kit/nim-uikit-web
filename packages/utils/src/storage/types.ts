export interface StorageInterface {
  store: Map<string, any>
  type: string
  salt: string
  get(key: string): any
  set(key: string, value: any): void
  remove(key: string): void
}
