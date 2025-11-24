import { IpcMain } from 'electron'
import { APP_API, GetAppInfoParams } from '../../common/app'

export function registerAppApi(ipcMain: IpcMain): void {
  ipcMain.handle(APP_API.GET_APP_INFO, async (_event, params: GetAppInfoParams) => {
    const info: {
      appName: string
      versions?: { electron: string; chrome: string; node: string }
      platform?: string
    } = {
      appName: 'Electron Starter'
    }

    if (params.includeVersions) {
      info.versions = {
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node
      }
    }

    if (params.includePlatform) {
      info.platform = process.platform
    }

    return info
  })
}
