import { RECOVERY_MACRO } from '../recovery/macroShim.js'
import memoize from 'lodash-es/memoize.js'
import { getSessionId } from '../bootstrap/state.js'
import { getHostPlatformForAnalytics } from './env.js'

export type GitHubActionsMetadata = {
  actor?: string
  actorId?: string
  repository?: string
  repositoryId?: string
  repositoryOwner?: string
  repositoryOwnerId?: string
}

export type CoreUserData = {
  deviceId: string
  sessionId: string
  email?: string
  appVersion: string
  platform: ReturnType<typeof getHostPlatformForAnalytics>
  organizationUuid?: string
  accountUuid?: string
  userType?: string
  subscriptionType?: string
  rateLimitTier?: string
  firstTokenTime?: number
  githubActionsMetadata?: GitHubActionsMetadata
}

export async function initUser(): Promise<void> {}

export function resetUserCache(): void {
  getCoreUserData.cache.clear?.()
  getGitEmail.cache.clear?.()
}

export const getCoreUserData = memoize(
  (_includeAnalyticsMetadata?: boolean): CoreUserData => {
    const sessionId = getSessionId()

    return {
      // April Code does not persist a device identifier.
      deviceId: sessionId,
      sessionId,
      appVersion: RECOVERY_MACRO.VERSION,
      platform: getHostPlatformForAnalytics(),
      userType: process.env.USER_TYPE,
    }
  },
)

export function getUserForGrowthBook(): CoreUserData {
  return getCoreUserData(false)
}

export const getGitEmail = memoize(async (): Promise<string | undefined> => {
  return undefined
})
