import { useEffect } from 'react'
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { UpdateStatus } from '../../../common/updater'

/**
 * Hook to access the current update status.
 * Listens to real-time status updates from the main process.
 */
export const useUpdateStatus = (): UseQueryResult<UpdateStatus, Error> => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['updater-status'],
    queryFn: (): Promise<UpdateStatus> => window.api.updater.getStatus()
  })

  useEffect(() => {
    // Subscribe to status changes from main process
    const unsubscribe = window.api.updater.onStatusChanged((status) => {
      queryClient.setQueryData(['updater-status'], status)
    })

    return unsubscribe
  }, [queryClient])

  return query
}
