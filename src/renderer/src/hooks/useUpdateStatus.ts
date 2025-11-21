import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { UpdateStatus } from '../../../common/updater'

/**
 * Hook to access the current update status.
 * Polls the main process every 5 seconds to check for update state changes.
 */
export const useUpdateStatus = (): UseQueryResult<UpdateStatus, Error> => {
  return useQuery({
    queryKey: ['updater-status'],
    queryFn: (): Promise<UpdateStatus> => window.api.updater.getStatus(),
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0 // Always consider data stale so it refetches
  })
}
