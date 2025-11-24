export const UPDATER_API = {
  CHECK_FOR_UPDATES: 'updater:checkForUpdates',
  DOWNLOAD_UPDATE: 'updater:downloadUpdate',
  INSTALL_UPDATE: 'updater:installUpdate',
  GET_UPDATE_STATUS: 'updater:getUpdateStatus',
  STATUS_CHANGED: 'updater:statusChanged'
} as const

export type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available'; version: string }
  | { state: 'downloading'; percent: number }
  | { state: 'ready'; version: string }
  | { state: 'up-to-date'; version: string }
  | { state: 'error'; message: string }
