import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Deriva una clave AES-256 a partir del UID del usuario + secreto de entorno
 * Así cada usuario tiene una clave única aunque el secreto sea compartido
 */
function deriveKey(userId: string): Buffer {
  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) throw new Error('ENCRYPTION_SECRET no definido')
  return crypto.scryptSync(`${userId}:${secret}`, 'notevault-salt', KEY_LENGTH)
}

/**
 * Cifra un texto plano usando AES-256-GCM
 * Retorna: iv:tag:ciphertext en hex
 */
export function encrypt(plaintext: string, userId: string): string {
  const key = deriveKey(userId)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

/**
 * Descifra un texto cifrado con encrypt()
 */
export function decrypt(ciphertext: string, userId: string): string {
  const key = deriveKey(userId)
  const [ivHex, tagHex, encryptedHex] = ciphertext.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
