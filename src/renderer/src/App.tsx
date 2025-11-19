import { useState } from 'react'
import electronLogo from './assets/electron.svg'
import { Button } from './components/ui/button'

function App(): React.JSX.Element {
  const [appInfo, setAppInfo] = useState<string>('')
  const [greeting, setGreeting] = useState<string>('')

  const handleGetInfo = async (): Promise<void> => {
    const info = await window.api.app.getAppInfo({
      includeVersions: true,
      includePlatform: true
    })
    const message = `${info.appName} • ${info.platform} • Electron ${info.versions?.electron}`
    setAppInfo(message)
  }

  const handleGreet = async (): Promise<void> => {
    const greeting = await window.api.app.greetUser({
      name: 'Developer',
      timeOfDay: 'morning'
    })
    setGreeting(greeting.greeting)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              className="w-20 h-20 animate-[spin_8s_linear_infinite]"
              alt="Electron logo"
              src={electronLogo}
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Electron + React</h1>
          <p className="text-muted-foreground text-lg">
            IPC API Examples with Tailwind & shadcn/ui
          </p>
        </div>

        {/* API Demo Cards */}
        <div className="space-y-4">
          {/* App Info Card */}
          <div className="border rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-lg">System Information</h3>
                <p className="text-sm text-muted-foreground">
                  Get app name, platform, and Electron version
                </p>
                {appInfo && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <code className="text-sm text-foreground">{appInfo}</code>
                  </div>
                )}
              </div>
              <Button onClick={handleGetInfo} variant="outline">
                Get Info
              </Button>
            </div>
          </div>

          {/* Greeting Card */}
          <div className="border rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-lg">Greeting</h3>
                <p className="text-sm text-muted-foreground">Get a personalized greeting message</p>
                {greeting && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <code className="text-sm text-foreground">{greeting}</code>
                  </div>
                )}
              </div>
              <Button onClick={handleGreet} variant="outline">
                Greet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
