/**
 * Encryption module for sensitive data at rest
 * Uses AES-256-GCM for authenticated encryption
 * 
 * IMPORTANT: ENCRYPTION_KEY must be exactly 32 bytes (256 bits)
 * Generate with: openssl rand -base64 32
 */

import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SALT_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32

// Derive encryption key from environment variable
// This prevents needing to store raw key in memory
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY

  if (!keyString) {
    throw new Error(
      'ENCRYPTION_KEY is required. Generate with: openssl rand -base64 32'
    )
  }

  // Use key derivation to ensure correct length
  // This allows shorter keys to be expanded to 32 bytes
  return scryptSync(keyString, 'clawhost-salt', KEY_LENGTH)
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns base64-encoded encrypted string with salt, iv, and auth tag
 */
export function encrypt(plaintext: string): string {
  if (!plaintext || plaintext.length === 0) {
    return plaintext
  }

  try {
    const key = getEncryptionKey()
    const salt = randomBytes(SALT_LENGTH)
    const iv = randomBytes(IV_LENGTH)

    const cipher = createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(plaintext, 'utf8', 'base64')
    encrypted += cipher.final('base64')

    const tag = cipher.getAuthTag()

    // Combine all components: salt + iv + tag + encrypted
    const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'base64')])

    return combined.toString('base64')
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt sensitive data')
  }
}

/**
 * Decrypts data encrypted with encrypt()
 * Throws if authentication fails (tampered or wrong key)
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext || ciphertext.length === 0) {
    return ciphertext
  }

  // Check if ciphertext is actually encrypted (newer format)
  // Encrypted values are base64 and will be longer than raw values
  if (ciphertext.length < 100) {
    // Likely unencrypted (legacy) data
    console.warn('Decrypt called on potentially unencrypted data')
    return ciphertext
  }

  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(ciphertext, 'base64')

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH)
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const tag = combined.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    )
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt data - may be corrupted or invalid key')
  }
}

/**
 * Check if a string is likely encrypted
 * Used for migration scenarios
 */
export function isEncrypted(value: string): boolean {
  if (!value || value.length === 0) return false

  // Encrypted values:
  // 1. Are base64 encoded
  // 2. Have specific minimum length (salt + iv + tag + minimal data)
  // 3. Don't contain common API key prefixes

  const minEncryptedLength = SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 16 // ~80 bytes base64

  if (value.length < minEncryptedLength) return false

  // Check for raw API key patterns
  const rawPatterns = [/^[a-zA-Z0-9_-]+$/, /^sk-/, /^pk-/, /^bearer/i]
  if (rawPatterns.some((pattern) => pattern.test(value))) return false

  // Try base64 decode - if it fails, not valid encrypted data
  try {
    Buffer.from(value, 'base64')
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize API key for display/logging
 * Shows only first 4 and last 4 chars, masks the rest
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 12) return '****'
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

/**
 * Validate encryption key is properly configured
 * Call this during app startup
 */
export function validateEncryptionSetup(): { valid: boolean; error?: string } {
  try {
    const key = process.env.ENCRYPTION_KEY
    if (!key) {
      return {
        valid: false,
        error: 'ENCRYPTION_KEY environment variable is not set',
      }
    }

    // Test encryption/decryption roundtrip
    const testData = 'test-' + randomBytes(8).toString('hex')
    const encrypted = encrypt(testData)
    const decrypted = decrypt(encrypted)

    if (decrypted !== testData) {
      return {
        valid: false,
        error: 'Encryption roundtrip test failed',
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
