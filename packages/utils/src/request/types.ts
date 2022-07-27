export interface RequestHelper {
  baseDomain: string
  version: string
  clientType?: ClientType
  init(params: NERequestInitParams): void
  destroy(): void
  request<T>(params: NERequestParams): Promise<T>
}

export type ClientType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 // 1：TV，2：IOS，3：AOS，4：PC，5：MAC，6：WEB，7：SIP, 8:LINUX, 9:MINIAPP

export interface NERequestInitParams {
  baseDomain: string
  version: string
  clientType: ClientType
}

export interface NERequestParams {
  method?: 'GET' | 'POST'
  url: string
  data?: any
  headers?: any
}

export interface RequestFn {
  <T>(params: NERequestParams): Promise<{ code: number; msg: string; data: T }>
}
