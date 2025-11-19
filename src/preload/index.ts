import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  APP_API,
  GetAppInfoParams,
  GetAppInfoReturn,
  GreetUserParams,
  GreetUserReturn
} from '../common/app'

// Custom APIs for renderer
export const api = {
  app: {
    getAppInfo: (params: GetAppInfoParams): Promise<GetAppInfoReturn> =>
      ipcRenderer.invoke(APP_API.GET_APP_INFO, params),
    greetUser: (params: GreetUserParams): Promise<GreetUserReturn> =>
      ipcRenderer.invoke(APP_API.GREET_USER, params)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
