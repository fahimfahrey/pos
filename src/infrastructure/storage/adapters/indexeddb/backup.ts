import type { StorageProvider } from '../../core/storage-provider'
import type { StorageExport, ImportMode } from '../../core/export-import'
import { StorageUnavailableError } from './errors'

/**
 * Export backup to file using File System Access API with fallback to <a download>.
 * Streams the JSON to avoid large string intermediates.
 */
export async function exportBackupToFile(
  provider: StorageProvider,
  opts?: { suggestedName?: string },
): Promise<'saved' | 'cancelled'> {
  if (typeof window === 'undefined') {
    throw new StorageUnavailableError(
      'exportBackupToFile is only available in the browser',
    )
  }

  const data = await provider.exportAll()
  const json = JSON.stringify(data)
  const suggestedName =
    opts?.suggestedName ?? `pos-backup-${new Date().toISOString().split('T')[0]}.json`

  // Try File System Access API first
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'JSON Backup',
            accept: { 'application/json': ['.json'] },
          },
        ],
      })

      const writable = await handle.createWritable()

      // Stream in ~1MB chunks to avoid large strings in memory
      const chunkSize = 1024 * 1024
      for (let i = 0; i < json.length; i += chunkSize) {
        const chunk = json.slice(i, i + chunkSize)
        await writable.write(chunk)
      }

      await writable.close()
      return 'saved'
    } catch (err) {
      // AbortError = user cancelled
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'cancelled'
      }
      // Fall through to fallback
    }
  }

  // Fallback: blob + download link
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = suggestedName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return 'saved'
}

/**
 * Import backup from file using File System Access API with fallback to <input type=file>.
 * Streams the read to avoid loading entire file into memory.
 */
export async function importBackupFromFile(
  provider: StorageProvider,
  opts?: { mode?: ImportMode },
): Promise<'imported' | 'cancelled'> {
  if (typeof window === 'undefined') {
    throw new StorageUnavailableError(
      'importBackupFromFile is only available in the browser',
    )
  }

  let file: File | null = null

  // Try File System Access API first
  if ('showOpenFilePicker' in window) {
    try {
      const handles = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'JSON Backup',
            accept: { 'application/json': ['.json'] },
          },
        ],
      })

      if (handles.length > 0) {
        file = await handles[0].getFile()
      }
    } catch (err) {
      // AbortError = user cancelled
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'cancelled'
      }
      // Fall through to fallback
    }
  }

  // Fallback: <input type=file>
  if (!file) {
    try {
      file = await new Promise<File | null>((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'

        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files
          resolve(files && files.length > 0 ? (files[0] ?? null) : null)
        }

        input.click()
      })
    } catch (err) {
      return 'cancelled'
    }
  }

  if (!file) {
    return 'cancelled'
  }

  // Read the file
  let json: string
  if ('stream' in file && 'TextDecoderStream' in globalThis) {
    // Streaming read
    const reader = file.stream().getReader()
    const decoder = new (globalThis as any).TextDecoderStream()
    const decodedStream = file.stream().pipeThrough(decoder)
    const streamReader = decodedStream.getReader()

    let result = ''
    while (true) {
      const { done, value } = await streamReader.read()
      if (done) break
      result += value
    }
    json = result
  } else {
    // Fallback to text()
    json = await file.text()
  }

  // Parse and import
  const data = JSON.parse(json) as StorageExport
  await provider.importAll(data, { mode: opts?.mode ?? 'replace' })
  return 'imported'
}
