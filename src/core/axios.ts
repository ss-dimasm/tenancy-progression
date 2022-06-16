import { ReapitConnectSession } from '@reapit/connect-session'
import axios from 'axios'
import { BASE_HEADERS } from '../constants/api'
import { reapitConnectBrowserSession } from './connect-session'

export const Axios = axios.create({
  baseURL: window.reapit.config.platformApiUrl,
  headers: {
    ...BASE_HEADERS,
  },
})
;(async () => {
  const AuthorizationHeader = (await reapitConnectBrowserSession.connectSession()) as ReapitConnectSession
  Axios.defaults.headers['Authorization'] = AuthorizationHeader.accessToken
})()
