import axios, { AxiosResponse } from 'axios'
import { NERequestParams, NERequestInitParams, RequestHelper } from './types'

async function request<T>({
  method = 'POST',
  url,
  data,
  headers,
}: NERequestParams): Promise<T> {
  try {
    const res: AxiosResponse<T & { code: number; msg: string }> = await axios({
      method,
      url,
      data,
      headers,
    })
    if (res.data.code !== 200) {
      return Promise.reject(res.data)
    }
    return res.data
  } catch (err) {
    return Promise.reject(err)
  }
}

export default request
