import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'
import { chmodSync } from 'fs'
import { hostname, homedir, userInfo } from 'os'
import { join } from 'path'
import { getClaudeConfigHomeDir } from '../envUtils.js'
import { getErrnoCode } from '../errors.js'
import { getFsImplementation } from '../fsOperations.js'
import {
  jsonParse,
  jsonStringify,
  writeFileSync_DEPRECATED,
} from '../slowOperations.js'
import type { SecureStorage, SecureStorageData } from './types.js'

const STORAGE_FILE_NAME = '.credentials.json'
const ENCRYPTION_VERSION = 1
const ENCRYPTION_ALGORITHM = 'aes-256-gcm'

type EncryptedStorageEnvelope = {
  version: number
  algorithm: string
  salt: string
  iv: string
  authTag: string
  ciphertext: string
}

function getStoragePath(): { storageDir: string; storagePath: string } {
  const storageDir = getClaudeConfigHomeDir()
  return { storageDir, storagePath: join(storageDir, STORAGE_FILE_NAME) }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isEncryptedEnvelope(value: unknown): value is EncryptedStorageEnvelope {
  return (
    isRecord(value) &&
    value.version === ENCRYPTION_VERSION &&
    value.algorithm === ENCRYPTION_ALGORITHM &&
    typeof value.salt === 'string' &&
    typeof value.iv === 'string' &&
    typeof value.authTag === 'string' &&
    typeof value.ciphertext === 'string'
  )
}

function safeUsername(): string {
  try {
    return userInfo().username
  } catch {
    return process.env.USER || 'unknown'
  }
}

function readMachineId(): string | undefined {
  const fs = getFsImplementation()
  for (const path of ['/etc/machine-id', '/var/lib/dbus/machine-id']) {
    try {
      const value = fs.readFileSync(path, { encoding: 'utf8' }).trim()
      if (value) {
        return value
      }
    } catch {
      // ignore
    }
  }
  return undefined
}

function getEncryptionSecret(): string {
  const envSecret =
    process.env.APRIL_SECURE_STORAGE_KEY ||
    process.env.CLAUDE_SECURE_STORAGE_KEY
  if (envSecret?.trim()) {
    return envSecret.trim()
  }

  const machineId = readMachineId()
  if (machineId) {
    return ['april-code-secure-storage', machineId].join('\n')
  }

  return [
    'april-code-secure-storage',
    hostname(),
    safeUsername(),
    homedir(),
  ].join('\n')
}

function decryptEnvelope(
  envelope: EncryptedStorageEnvelope,
): SecureStorageData | null {
  try {
    const salt = Buffer.from(envelope.salt, 'base64')
    const iv = Buffer.from(envelope.iv, 'base64')
    const authTag = Buffer.from(envelope.authTag, 'base64')
    const ciphertext = Buffer.from(envelope.ciphertext, 'base64')
    const key = scryptSync(getEncryptionSecret(), salt, 32)
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8')
    const parsed = jsonParse(plaintext)
    return isRecord(parsed) ? (parsed as SecureStorageData) : null
  } catch {
    return null
  }
}

function serializeEncryptedData(data: SecureStorageData): string {
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const key = scryptSync(getEncryptionSecret(), salt, 32)
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([
    cipher.update(jsonStringify(data), 'utf8'),
    cipher.final(),
  ])

  return jsonStringify({
    version: ENCRYPTION_VERSION,
    algorithm: ENCRYPTION_ALGORITHM,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  } satisfies EncryptedStorageEnvelope)
}

function ensureStorageDir(storageDir: string): void {
  try {
    getFsImplementation().mkdirSync(storageDir)
  } catch (error: unknown) {
    if (getErrnoCode(error) !== 'EEXIST') {
      throw error
    }
  }
}

function writeEncryptedData(
  data: SecureStorageData,
): { success: boolean; warning?: string } {
  try {
    const { storageDir, storagePath } = getStoragePath()
    ensureStorageDir(storageDir)
    writeFileSync_DEPRECATED(storagePath, serializeEncryptedData(data), {
      encoding: 'utf8',
      flush: false,
    })
    chmodSync(storagePath, 0o600)
    return { success: true }
  } catch {
    return { success: false }
  }
}

function parseStoredPayload(payload: string): SecureStorageData | null {
  try {
    const parsed = jsonParse(payload)
    if (isEncryptedEnvelope(parsed)) {
      return decryptEnvelope(parsed)
    }
    if (!isRecord(parsed)) {
      return null
    }
    return parsed as SecureStorageData
  } catch {
    return null
  }
}

function readStoragePayloadSync(): string | null {
  const { storagePath } = getStoragePath()
  try {
    return getFsImplementation().readFileSync(storagePath, { encoding: 'utf8' })
  } catch {
    return null
  }
}

async function readStoragePayloadAsync(): Promise<string | null> {
  const { storagePath } = getStoragePath()
  try {
    return await getFsImplementation().readFile(storagePath, { encoding: 'utf8' })
  } catch {
    return null
  }
}

function migrateLegacyPayload(payload: string, data: SecureStorageData): void {
  try {
    const parsed = jsonParse(payload)
    if (!isEncryptedEnvelope(parsed)) {
      writeEncryptedData(data)
    }
  } catch {
    // ignore malformed payloads
  }
}

export const plainTextStorage = {
  name: 'encrypted-file',
  read(): SecureStorageData | null {
    const payload = readStoragePayloadSync()
    if (!payload) {
      return null
    }

    const data = parseStoredPayload(payload)
    if (data) {
      migrateLegacyPayload(payload, data)
    }
    return data
  },
  async readAsync(): Promise<SecureStorageData | null> {
    const payload = await readStoragePayloadAsync()
    if (!payload) {
      return null
    }

    const data = parseStoredPayload(payload)
    if (data) {
      migrateLegacyPayload(payload, data)
    }
    return data
  },
  update(data: SecureStorageData): { success: boolean; warning?: string } {
    return writeEncryptedData(data)
  },
  delete(): boolean {
    const { storagePath } = getStoragePath()
    try {
      getFsImplementation().unlinkSync(storagePath)
      return true
    } catch (error: unknown) {
      return getErrnoCode(error) === 'ENOENT'
    }
  },
} satisfies SecureStorage
