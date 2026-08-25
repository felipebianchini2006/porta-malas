"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentUser, requireAdmin } from "@/lib/auth/session"
import { query } from "@/lib/db"

export interface CategoriaMala {
  id: string
  emoji: string
  nome: string
  exemplos: string
  descricao: string
  preco_diaria: number
  preco_meio_periodo: number
  ativo: boolean
  ordem: number
  created_at: string
  updated_at: string
}

export interface CategoriaMalaInput {
  emoji: string
  nome: string
  exemplos?: string
  descricao?: string
  preco_diaria: number
  preco_meio_periodo: number
  ordem?: number
}

interface CategoriaMalaRow extends Omit<CategoriaMala, "preco_diaria" | "preco_meio_periodo"> {
  preco_diaria: string
  preco_meio_periodo: string
}

type MutationResult = { success: boolean; categoria?: CategoriaMala; error?: string }

const moneySchema = z.number().finite().min(0).max(100_000).refine(
  (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
  "Use no máximo duas casas decimais"
)

const categoriaSchema = z.object({
  emoji: z.string().trim().min(1, "Emoji obrigatório").max(16, "Emoji muito longo"),
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(80),
  exemplos: z.string().trim().max(160).optional().default(""),
  descricao: z.string().trim().max(120).optional(),
  preco_diaria: moneySchema,
  preco_meio_periodo: moneySchema,
  ordem: z.number().int().min(0).max(9999).optional().default(0),
})

function mapCategoria(row: CategoriaMalaRow): CategoriaMala {
  return {
    ...row,
    preco_diaria: Number(row.preco_diaria),
    preco_meio_periodo: Number(row.preco_meio_periodo),
  }
}

function parseInput(input: CategoriaMalaInput) {
  const result = categoriaSchema.safeParse(input)
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Dados inválidos" } as const
  }
  return {
    data: {
      ...result.data,
      descricao: result.data.descricao || result.data.nome,
    },
  } as const
}

function revalidateCategorias() {
  revalidatePath("/checkin")
  revalidatePath("/admin/categorias")
}

export async function listarCategoriasMalaAtivas(): Promise<CategoriaMala[]> {
  if (!(await getCurrentUser())) return []
  const result = await query<CategoriaMalaRow>(
    `SELECT id, emoji, nome, exemplos, descricao, preco_diaria, preco_meio_periodo,
            ativo, ordem, created_at, updated_at
       FROM categorias_mala
      WHERE ativo = true
      ORDER BY ordem, nome`
  )
  return result.rows.map(mapCategoria)
}

export async function listarCategoriasMalaAdmin(): Promise<CategoriaMala[]> {
  try {
    await requireAdmin()
    const result = await query<CategoriaMalaRow>(
      `SELECT id, emoji, nome, exemplos, descricao, preco_diaria, preco_meio_periodo,
              ativo, ordem, created_at, updated_at
         FROM categorias_mala
        ORDER BY ordem, nome`
    )
    return result.rows.map(mapCategoria)
  } catch (error) {
    console.error("Erro ao listar categorias:", error)
    return []
  }
}

export async function criarCategoriaMala(input: CategoriaMalaInput): Promise<MutationResult> {
  try {
    await requireAdmin()
    const parsed = parseInput(input)
    if ("error" in parsed) return { success: false, error: parsed.error }
    const value = parsed.data
    const result = await query<CategoriaMalaRow>(
      `INSERT INTO categorias_mala (
         emoji, nome, exemplos, descricao, preco_diaria, preco_meio_periodo, ordem
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, emoji, nome, exemplos, descricao, preco_diaria, preco_meio_periodo,
                 ativo, ordem, created_at, updated_at`,
      [value.emoji, value.nome, value.exemplos, value.descricao, value.preco_diaria, value.preco_meio_periodo, value.ordem]
    )
    revalidateCategorias()
    return { success: true, categoria: mapCategoria(result.rows[0]) }
  } catch (error) {
    return mutationError(error, "Erro ao criar categoria")
  }
}

export async function atualizarCategoriaMala(id: string, input: CategoriaMalaInput): Promise<MutationResult> {
  try {
    await requireAdmin()
    if (!id.trim()) return { success: false, error: "Categoria inválida" }
    const parsed = parseInput(input)
    if ("error" in parsed) return { success: false, error: parsed.error }
    const value = parsed.data
    const result = await query<CategoriaMalaRow>(
      `UPDATE categorias_mala
          SET emoji = $2, nome = $3, exemplos = $4, descricao = $5,
              preco_diaria = $6, preco_meio_periodo = $7, ordem = $8,
              updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      RETURNING id, emoji, nome, exemplos, descricao, preco_diaria, preco_meio_periodo,
                ativo, ordem, created_at, updated_at`,
      [id, value.emoji, value.nome, value.exemplos, value.descricao, value.preco_diaria, value.preco_meio_periodo, value.ordem]
    )
    if (!result.rows[0]) return { success: false, error: "Categoria não encontrada" }
    revalidateCategorias()
    return { success: true, categoria: mapCategoria(result.rows[0]) }
  } catch (error) {
    return mutationError(error, "Erro ao atualizar categoria")
  }
}

export async function toggleCategoriaMalaAtiva(id: string, ativo: boolean): Promise<MutationResult> {
  try {
    await requireAdmin()
    if (!id.trim() || typeof ativo !== "boolean") return { success: false, error: "Dados inválidos" }
    const result = await query<CategoriaMalaRow>(
      `UPDATE categorias_mala
          SET ativo = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      RETURNING id, emoji, nome, exemplos, descricao, preco_diaria, preco_meio_periodo,
                ativo, ordem, created_at, updated_at`,
      [id, ativo]
    )
    if (!result.rows[0]) return { success: false, error: "Categoria não encontrada" }
    revalidateCategorias()
    return { success: true, categoria: mapCategoria(result.rows[0]) }
  } catch (error) {
    return mutationError(error, "Erro ao atualizar categoria")
  }
}

export async function excluirCategoriaMala(id: string): Promise<MutationResult> {
  try {
    await requireAdmin()
    if (!id.trim()) return { success: false, error: "Categoria inválida" }
    const result = await query<{ id: string }>(
      `DELETE FROM categorias_mala c
        WHERE c.id = $1
          AND NOT EXISTS (SELECT 1 FROM malas m WHERE m.categoria_id = c.id)
      RETURNING c.id`,
      [id]
    )
    if (!result.rows[0]) {
      return { success: false, error: "Categoria em uso não pode ser excluída; desative-a" }
    }
    revalidateCategorias()
    return { success: true }
  } catch (error) {
    return mutationError(error, "Erro ao excluir categoria")
  }
}

function mutationError(error: unknown, fallback: string): MutationResult {
  if (error && typeof error === "object" && "code" in error && error.code === "23505") {
    return { success: false, error: "Já existe uma categoria com este nome" }
  }
  const message = error instanceof Error && ["Não autenticado", "Sem permissão"].includes(error.message)
    ? error.message
    : fallback
  if (message === fallback) console.error(`${fallback}:`, error)
  return { success: false, error: message }
}
