/**
 * Maps storage error codes to plain-language user messages.
 * Per Architecture Decision 3 in the non-happy-states plan.
 */

export interface StorageErrorInfo {
  title: string
  message: string
  kind: 'system'
}

const STORAGE_ERROR_MAP: Record<string, StorageErrorInfo> = {
  STORAGE_QUOTA_EXCEEDED: {
    title: 'Storage full',
    message:
      'This device is out of storage space. Free up space (clear browser data for other sites, or delete old receipts) and try again.',
    kind: 'system',
  },
  STORAGE_UPGRADE_BLOCKED: {
    title: 'Database updating',
    message: 'Another open tab is updating the local database. Close other tabs of this app and try again.',
    kind: 'system',
  },
  STORAGE_UNAVAILABLE: {
    title: 'Storage not available',
    message:
      "This browser doesn't support local storage in its current mode (e.g. private/incognito browsing). Switch to a normal browser window.",
    kind: 'system',
  },
  STORAGE_CLONE_UNSUPPORTED: {
    title: 'Technical issue',
    message: 'An internal storage error occurred. Your data is safe. Please try again.',
    kind: 'system',
  },
}

const DEFAULT_ERROR: StorageErrorInfo = {
  title: 'Something went wrong',
  message: 'Something went wrong saving/loading your data. Your existing data on this device is safe. Please try again.',
  kind: 'system',
}

export function getStorageErrorMessage(errorCode?: string): StorageErrorInfo {
  if (!errorCode) {
    return DEFAULT_ERROR
  }

  return STORAGE_ERROR_MAP[errorCode] || DEFAULT_ERROR
}
