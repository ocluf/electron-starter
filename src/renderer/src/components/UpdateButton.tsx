import { Download, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { useUpdateStatus } from '../hooks/useUpdateStatus'

/**
 * Manual update control button for settings pages.
 * Allows users to check, download, and install updates manually.
 * The button UI adapts based on the current update state.
 */
export const UpdateButton = (): React.JSX.Element => {
  const { data: status } = useUpdateStatus()

  const handleCheck = (): void => {
    window.api.updater.checkForUpdates()
  }

  const handleDownload = (): void => {
    window.api.updater.downloadUpdate()
  }

  const handleInstall = (): void => {
    window.api.updater.installUpdate()
  }

  // Loading state
  if (!status) {
    return (
      <Button variant="outline" disabled>
        <RefreshCw className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  // Checking state
  if (status.state === 'checking') {
    return (
      <Button variant="outline" disabled>
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        Checking...
      </Button>
    )
  }

  // Update available
  if (status.state === 'available') {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm">
          <span className="font-medium">Update available:</span>
          <span className="text-muted-foreground ml-1">v{status.version}</span>
        </div>
        <Button onClick={handleDownload} variant="default">
          <Download className="h-4 w-4 mr-2" />
          Download Update
        </Button>
      </div>
    )
  }

  // Downloading
  if (status.state === 'downloading') {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">Downloading update: {status.percent}%</div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${status.percent}%` }}
          />
        </div>
        <Button disabled variant="secondary">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Downloading...
        </Button>
      </div>
    )
  }

  // Ready to install
  if (status.state === 'ready') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="font-medium">Update ready:</span>
          <span className="text-muted-foreground">v{status.version}</span>
        </div>
        <Button onClick={handleInstall} variant="default">
          Restart & Install
        </Button>
      </div>
    )
  }

  // Up to date
  if (status.state === 'up-to-date') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-muted-foreground">You&apos;re up to date (v{status.version})</span>
        </div>
        <Button onClick={handleCheck} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Again
        </Button>
      </div>
    )
  }

  // Error state
  if (status.state === 'error') {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-destructive">{status.message}</div>
        <Button onClick={handleCheck} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Idle state - show check button
  return (
    <Button onClick={handleCheck} variant="outline">
      <RefreshCw className="h-4 w-4 mr-2" />
      Check for Updates
    </Button>
  )
}
