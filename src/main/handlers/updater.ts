import { autoUpdater } from 'electron-updater'
import { IpcMain, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import { UPDATER_API, UpdateStatus } from '../../common/updater'

// Check for updates every 24 hours
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000

class Updater {
  private status: UpdateStatus = { state: 'idle' }
  private checkInterval: NodeJS.Timeout | null = null
  private upToDateTimeout: NodeJS.Timeout | null = null
  private mainWindow: BrowserWindow | null = null

  constructor(mainWindow?: BrowserWindow) {
    this.mainWindow = mainWindow || null
    this.init()
  }

  private setStatus(newStatus: UpdateStatus): void {
    this.status = newStatus
    // Notify renderer of status change
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(UPDATER_API.STATUS_CHANGED, newStatus)
    }
  }

  private init(): void {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false

    // Configure feed URL if env vars are present
    const owner = import.meta.env.VITE_PUBLISH_OWNER
    const repo = import.meta.env.VITE_PUBLISH_REPO

    if (owner && repo) {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner,
        repo
      })
    } else {
      console.warn(
        '[Updater] VITE_PUBLISH_OWNER and VITE_PUBLISH_REPO not configured. ' +
          'Auto-updates are disabled. See .env.example for configuration.'
      )
    }

    this.setupEvents()
    this.startPolling()
  }

  private setupEvents(): void {
    autoUpdater.on('checking-for-update', () => {
      this.setStatus({ state: 'checking' })
    })

    autoUpdater.on('update-available', (info) => {
      this.setStatus({
        state: 'available',
        version: info.version
      })
    })

    autoUpdater.on('update-not-available', (info) => {
      this.setStatus({
        state: 'up-to-date',
        version: info.version
      })

      // Reset to idle after 5 seconds
      if (this.upToDateTimeout) {
        clearTimeout(this.upToDateTimeout)
      }
      this.upToDateTimeout = setTimeout(() => {
        if (this.status.state === 'up-to-date') {
          this.setStatus({ state: 'idle' })
        }
      }, 5000)
    })

    autoUpdater.on('error', (err) => {
      this.setStatus({
        state: 'error',
        message: err.message
      })
    })

    autoUpdater.on('download-progress', (progressObj) => {
      this.setStatus({
        state: 'downloading',
        percent: Math.round(progressObj.percent)
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      this.setStatus({
        state: 'ready',
        version: info.version
      })
    })
  }

  private startPolling(): void {
    // Check immediately on startup
    this.checkForUpdates()

    // Poll at regular intervals
    this.checkInterval = setInterval(() => {
      this.checkForUpdates()
    }, UPDATE_CHECK_INTERVAL)
  }

  public async checkForUpdates(): Promise<void> {
    if (is.dev) {
      console.log('[Updater] Skipping update check in development')
      return
    }

    try {
      await autoUpdater.checkForUpdates()
    } catch (error) {
      console.error('Failed to check for updates:', error)
      this.setStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async downloadUpdate(): Promise<void> {
    await autoUpdater.downloadUpdate()
  }

  public quitAndInstall(): void {
    autoUpdater.quitAndInstall()
  }

  public getStatus(): UpdateStatus {
    return this.status
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    if (this.upToDateTimeout) {
      clearTimeout(this.upToDateTimeout)
    }
  }
}

export function registerUpdaterApi(ipcMain: IpcMain, mainWindow: BrowserWindow): void {
  const updater = new Updater(mainWindow)

  ipcMain.handle(UPDATER_API.CHECK_FOR_UPDATES, () => updater.checkForUpdates())
  ipcMain.handle(UPDATER_API.DOWNLOAD_UPDATE, () => updater.downloadUpdate())
  ipcMain.handle(UPDATER_API.INSTALL_UPDATE, () => updater.quitAndInstall())
  ipcMain.handle(UPDATER_API.GET_UPDATE_STATUS, () => updater.getStatus())
}
