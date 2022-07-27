import { NERequestParams, RequestFn } from './types'

async function request<T>({
  method = 'POST',
  url,
  data,
  headers,
}: NERequestParams): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: headers,
      success(res) {
        const data = res.data as T & { code: number; msg: string }
        if (data.code !== 200) {
          return reject(data.msg)
        }
        resolve(data)
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

export default request
