// API channel constants
export const APP_API = {
  GET_APP_INFO: 'app:getAppInfo',
  GREET_USER: 'app:greetUser'
} as const

// Parameter types
export type GetAppInfoParams = {
  includeVersions: boolean
  includePlatform: boolean
}

export type GreetUserParams = {
  name: string
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
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

export type GreetUserReturn = {
  greeting: string
  timestamp: number
}
