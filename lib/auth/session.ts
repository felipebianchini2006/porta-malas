import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import type { UserRole } from "@/lib/types"

export const SESSION_COOKIE = "porta_malas_session"
const SESSION_TTL_SECONDS = 60 * 60 * 12

interface SessionPayload {
  sub: string
  exp: number
}

export interface AuthenticatedUser {
  id: string
  email: string | null
  nome: string
  role: UserRole
  ativo: boolean
}

function secret(): string {
  const value = process.env.SESSION_SECRET
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET deve ter pelo menos 32 caracteres")
  }
  return value
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url")
}

function encode(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${body}.${sign(body)}`
}

function decode(token: string): SessionPayload | null {
  const [body, signature] = token.split(".")
  if (!body || !signature) return null

  const expected = Buffer.from(sign(body))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload
    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(
    SESSION_COOKIE,
    encode({ sub: userId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    }
  )
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = decode(token)
  if (!payload) return null

  const result = await query<AuthenticatedUser>(
    `SELECT id, email, nome, role, ativo
       FROM usuarios
      WHERE id = $1 AND ativo = true`,
    [payload.sub]
  )
  return result.rows[0] ?? null
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Não autenticado")
  return user
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireUser()
  if (user.role !== "admin") throw new Error("Sem permissão")
  return user
}
