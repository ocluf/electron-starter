import { useState } from 'react'
import { X, Download, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { useUpdateStatus } from '../hooks/useUpdateStatus'

/**
 * Automatic update notification popup that appears in the bottom-left corner.
 * Shows when updates are detected by the automatic 24h check cycle.
 * Can be dismissed by the user per version.
 */
export const UpdatePopup = (): React.JSX.Element | null => {
  const { data: status } = useUpdateStatus()
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null)

  const handleDownload = (): void => {
    window.api.updater.downloadUpdate()
  }

  const handleInstall = (): void => {
    window.api.updater.installUpdate()
  }

  const handleDismiss = (): void => {
    if (status?.state === 'available') {
      setDismissedVersion(status.version)
    }
  }

  // Don't show if no status or user dismissed this specific version
  if (!status) {
    return null
  }

  const isDismissed = status.state === 'available' && status.version === dismissedVersion

  if (isDismissed) {
    return null
  }

  // Only show for available, downloading, or ready states
  const shouldShow =
    status.state === 'available' || status.state === 'downloading' || status.state === 'ready'

  if (!shouldShow) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-card border rounded-lg shadow-xl p-4 z-50 animate-in slide-in-from-left-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold">
            {status.state === 'available' && 'Update Available'}
            {status.state === 'downloading' && 'Downloading Update'}
            {status.state === 'ready' && 'Update Ready'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {status.state === 'available' && `Version ${status.version}`}
            {status.state === 'downloading' && `${status.percent}% complete`}
            {status.state === 'ready' && `Version ${status.version} is ready to install`}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {status.state === 'downloading' && (
        <div className="mb-3">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${status.percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {status.state === 'available' && (
          <Button onClick={handleDownload} size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </Button>
        )}

        {status.state === 'downloading' && (
          <Button disabled size="sm" variant="secondary" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
            Downloading...
          </Button>
        )}

        {status.state === 'ready' && (
          <Button onClick={handleInstall} size="sm" className="flex-1">
            Restart & Install
          </Button>
        )}
      </div>
    </div>
  )
}
