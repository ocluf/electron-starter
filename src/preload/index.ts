import { contextBridge, ipcRenderer } from 'electron'
import { APP_API, GetAppInfoParams, GetAppInfoReturn } from '../common/app'
import { UPDATER_API, UpdateStatus } from '../common/updater'

// Custom APIs for renderer
export const api = {
  app: {
    getAppInfo: (params: GetAppInfoParams): Promise<GetAppInfoReturn> =>
      ipcRenderer.invoke(APP_API.GET_APP_INFO, params)
  },
  updater: {
    checkForUpdates: (): Promise<void> => ipcRenderer.invoke(UPDATER_API.CHECK_FOR_UPDATES),
    downloadUpdate: (): Promise<void> => ipcRenderer.invoke(UPDATER_API.DOWNLOAD_UPDATE),
    installUpdate: (): Promise<void> => ipcRenderer.invoke(UPDATER_API.INSTALL_UPDATE),
    getStatus: (): Promise<UpdateStatus> => ipcRenderer.invoke(UPDATER_API.GET_UPDATE_STATUS),
    onStatusChanged: (callback: (status: UpdateStatus) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, status: UpdateStatus): void => {
        callback(status)
      }
      ipcRenderer.on(UPDATER_API.STATUS_CHANGED, listener)
      return (): void => {
        ipcRenderer.removeListener(UPDATER_API.STATUS_CHANGED, listener)
      }
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
