import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const KEY_LENGTH = 64

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url')
  const derivedKey = await scrypt(password, salt)
  return `scrypt:${salt}:${derivedKey}`
}

export async function verifyPassword(password: string, storedHash: string) {
  if (storedHash.startsWith('scrypt:')) {
    const [scheme, salt, expected] = storedHash.split(':')
    if (scheme !== 'scrypt' || !salt || !expected) return false

    const actual = await scrypt(password, salt)
    return safeEqual(actual, expected)
  }

  if (
    storedHash.startsWith('$2a$') ||
    storedHash.startsWith('$2b$') ||
    storedHash.startsWith('$2y$')
  ) {
    return bcrypt.compare(password, storedHash)
  }

  if (storedHash.startsWith('bcrypt:')) {
    return bcrypt.compare(password, storedHash.slice('bcrypt:'.length))
  }

  return false
}

function scrypt(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (error, key) => {
      if (error) reject(error)
      else resolve(key.toString('base64url'))
    })
  })
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer)
}

