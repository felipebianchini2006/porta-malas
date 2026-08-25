import { createHash, randomBytes, scryptSync } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import process from "node:process"
import pg from "pg"

const { Client } = pg

function hashPassword(password) {
  const salt = randomBytes(16)
  const derived = scryptSync(password, salt, 64)
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL obrigatoria")

const client = new Client({ connectionString })
await client.connect()

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  const files = (await readdir(new URL("../migrations", import.meta.url)))
    .filter((file) => file.endsWith(".sql"))
    .sort()

  for (const filename of files) {
    const sql = await readFile(new URL(`../migrations/${filename}`, import.meta.url), "utf8")
    const checksum = createHash("sha256").update(sql).digest("hex")
    const existing = await client.query(
      "SELECT checksum FROM schema_migrations WHERE filename = $1",
      [filename],
    )

    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum) {
        throw new Error(`Migration ${filename} mudou depois de aplicada`)
      }
      continue
    }

    await client.query("BEGIN")
    try {
      await client.query(sql)
      await client.query(
        "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
        [filename, checksum],
      )
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    }
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim() || "Administrador"
  if (!email || !password) throw new Error("ADMIN_EMAIL e ADMIN_PASSWORD obrigatorias")

  await client.query(
    `INSERT INTO usuarios (nome, email, password_hash, role, ativo)
     VALUES ($1, $2, $3, 'admin', true)
     ON CONFLICT (email) DO NOTHING`,
    [name, email, hashPassword(password)],
  )
} finally {
  await client.end()
}
