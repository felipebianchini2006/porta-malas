import { query, transaction } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"

let bootstrapPromise: Promise<void> | null = null

async function runBootstrap(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const nome = process.env.ADMIN_NAME?.trim() || "Administrador"
  if (!email || !password) return

  const existingAdmin = await query<{ exists: boolean }>(
    "SELECT EXISTS (SELECT 1 FROM usuarios WHERE role = 'admin') AS exists"
  )
  if (existingAdmin.rows[0]?.exists) return

  const passwordHash = await hashPassword(password)
  await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('porta-malas-admin-bootstrap'))")
    await client.query(
      `INSERT INTO usuarios (nome, email, password_hash, role, ativo)
       SELECT $1, $2, $3, 'admin', true
        WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE role = 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [nome, email, passwordHash]
    )
  })
}

export async function ensureBootstrapAdmin(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap().catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }
  await bootstrapPromise
}
