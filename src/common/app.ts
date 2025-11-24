// API channel constants
export const APP_API = {
  GET_APP_INFO: 'app:getAppInfo'
} as const

// Parameter types
export type GetAppInfoParams = {
  includeVersions: boolean
  includePlatform: boolean
}

// Return types
export type GetAppInfoReturn = {
  appName: string
  versions?: {
    electron: string
    chrome: string
    node: string
  }
  platform?: string
}
