import { IpcMain } from 'electron'
import { APP_API, GetAppInfoParams, CalculateParams, GreetUserParams } from '../../common/app'

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

  ipcMain.handle(APP_API.CALCULATE, async (_event, params: CalculateParams) => {
    let result: number

    switch (params.operation) {
      case 'add':
        result = params.a + params.b
        break
      case 'subtract':
        result = params.a - params.b
        break
      case 'multiply':
        result = params.a * params.b
        break
      case 'divide':
        if (params.b === 0) {
          throw new Error('Division by zero')
        }
        result = params.a / params.b
        break
    }

    return {
      operation: params.operation,
      result,
      expression: `${params.a} ${params.operation} ${params.b} = ${result}`
    }
  })

  ipcMain.handle(APP_API.GREET_USER, async (_event, params: GreetUserParams) => {
    const timeOfDay = params.timeOfDay || 'day'
    let greeting: string

    switch (timeOfDay) {
      case 'morning':
        greeting = `Good morning, ${params.name}! ☀️`
        break
      case 'afternoon':
        greeting = `Good afternoon, ${params.name}! 🌤️`
        break
      case 'evening':
        greeting = `Good evening, ${params.name}! 🌙`
        break
      default:
        greeting = `Hello, ${params.name}! 👋`
    }

    return {
      greeting,
      timestamp: Date.now()
    }
  })
}
