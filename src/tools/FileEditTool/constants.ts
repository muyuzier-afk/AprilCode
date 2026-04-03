import { homedir } from 'os'
import { join, relative, sep } from 'path'
import { getClaudeConfigHomeDir } from '../../utils/envUtils.js'

// In its own file to avoid circular dependencies
export const FILE_EDIT_TOOL_NAME = 'Edit'

// Permission pattern for granting session-level access to the project's .claude/ folder
export const CLAUDE_FOLDER_PERMISSION_PATTERN = '/.claude/**'

export const LEGACY_GLOBAL_CLAUDE_FOLDER_PERMISSION_PATTERN = '~/.claude/**'

function toDisplayPath(path: string): string {
  const normalizedPath = path.normalize('NFC')
  const normalizedHome = homedir().normalize('NFC')

  if (normalizedPath === normalizedHome) {
    return '~'
  }

  const homePrefix = `${normalizedHome}${sep}`
  if (normalizedPath.startsWith(homePrefix)) {
    const relativePath = relative(normalizedHome, normalizedPath)
    return `~/${relativePath.replaceAll(sep, '/')}`
  }

  return normalizedPath.replaceAll(sep, '/')
}

// Permission pattern for granting session-level access to the global config folder
export function getGlobalClaudeFolderPermissionPattern(): string {
  return `${toDisplayPath(getClaudeConfigHomeDir())}/**`
}

export function getGlobalClaudeSettingsPermissionTarget(): string {
  return toDisplayPath(join(getClaudeConfigHomeDir(), 'settings.json'))
}

export const FILE_UNEXPECTEDLY_MODIFIED_ERROR =
  'File has been unexpectedly modified. Read it again before attempting to write it.'
