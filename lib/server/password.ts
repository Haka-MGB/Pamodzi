import crypto from 'crypto'

const KEY_LENGTH = 64

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url')
  const derivedKey = await scrypt(password, salt)
  return `scrypt:${salt}:${derivedKey}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, expected] = storedHash.split(':')
  if (scheme !== 'scrypt' || !salt || !expected) return false

  const actual = await scrypt(password, salt)
  return safeEqual(actual, expected)
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

