import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) throw new Error("A senha deve ter pelo menos 8 caracteres")
  const salt = randomBytes(16)
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `scrypt$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltValue, hashValue] = stored.split("$")
  if (algorithm !== "scrypt" || !saltValue || !hashValue) return false

  try {
    const salt = Buffer.from(saltValue, "base64url")
    const expected = Buffer.from(hashValue, "base64url")
    const actual = (await scrypt(password, salt, expected.length)) as Buffer
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}
