"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/session"
import { hashPassword } from "@/lib/auth/password"
import { query, transaction } from "@/lib/db"

export interface UsuarioComEmail {
  id: string
  nome: string
  email: string | null
  role: "admin" | "operador"
  ativo: boolean
  created_at: string
}

export async function criarUsuario(
  nome: string,
  email: string,
  senha: string,
  role: "admin" | "operador"
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin()
    const cleanName = nome.trim()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanName || !cleanEmail) return { error: "Nome e e-mail são obrigatórios" }
    const passwordHash = await hashPassword(senha)
    await query(
      `INSERT INTO usuarios (nome, email, password_hash, role, ativo)
       VALUES ($1, $2, $3, $4, true)`,
      [cleanName, cleanEmail, passwordHash, role]
    )
    revalidatePath("/admin/usuarios")
    return { success: true }
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "Já existe um usuário com este e-mail" }
    return { error: error instanceof Error ? error.message : "Erro ao criar usuário" }
  }
}

export async function listarUsuarios(): Promise<UsuarioComEmail[]> {
  try {
    await requireAdmin()
    const result = await query<UsuarioComEmail>(
      "SELECT id, nome, email, role, ativo, created_at FROM usuarios ORDER BY created_at"
    )
    return result.rows
  } catch (error) {
    console.error("Erro ao listar usuários:", error)
    return []
  }
}

export async function atualizarRole(
  userId: string,
  role: "admin" | "operador"
): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentUser = await requireAdmin()
    if (currentUser.id === userId) return { error: "Você não pode alterar seu próprio papel" }

    await transaction(async (client) => {
      const target = await client.query<{ role: "admin" | "operador" }>(
        "SELECT role FROM usuarios WHERE id = $1 FOR UPDATE",
        [userId]
      )
      if (!target.rows[0]) throw new Error("Usuário não encontrado")
      if (target.rows[0].role === "admin" && role !== "admin") {
        const admins = await client.query<{ total: string }>(
          "SELECT count(*) AS total FROM usuarios WHERE role = 'admin' AND ativo = true"
        )
        if (Number(admins.rows[0].total) <= 1) throw new Error("É necessário manter ao menos um administrador ativo")
      }
      await client.query("UPDATE usuarios SET role = $2 WHERE id = $1", [userId, role])
    })

    revalidatePath("/admin/usuarios")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao atualizar usuário" }
  }
}

export async function toggleAtivo(
  userId: string,
  ativo: boolean
): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentUser = await requireAdmin()
    if (currentUser.id === userId) return { error: "Você não pode desativar sua própria conta" }

    await transaction(async (client) => {
      const target = await client.query<{ role: "admin" | "operador"; ativo: boolean }>(
        "SELECT role, ativo FROM usuarios WHERE id = $1 FOR UPDATE",
        [userId]
      )
      if (!target.rows[0]) throw new Error("Usuário não encontrado")
      if (!ativo && target.rows[0].role === "admin" && target.rows[0].ativo) {
        const admins = await client.query<{ total: string }>(
          "SELECT count(*) AS total FROM usuarios WHERE role = 'admin' AND ativo = true"
        )
        if (Number(admins.rows[0].total) <= 1) throw new Error("É necessário manter ao menos um administrador ativo")
      }
      await client.query("UPDATE usuarios SET ativo = $2 WHERE id = $1", [userId, ativo])
    })

    revalidatePath("/admin/usuarios")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao atualizar usuário" }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505")
}
