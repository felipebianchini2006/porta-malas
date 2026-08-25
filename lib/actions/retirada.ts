"use server"

import { revalidatePath } from "next/cache"
import { query, transaction } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/session"

export interface SearchResult {
  atendimentos: AtendimentoComMalas[]
  error?: string
}

interface AtendimentoComMalas {
  id: string
  protocolo: string
  cliente_nome: string
  cliente_telefone: string
  observacoes: string | null
  valor_cobrado: number | null
  status: string
  data_checkin: string
  malas: { id: string; identificacao_interna: string; descricao: string | null; status: string }[]
}

interface AtendimentoSearchRow extends Omit<AtendimentoComMalas, "malas" | "valor_cobrado"> {
  valor_cobrado: string | null
  malas: AtendimentoComMalas["malas"]
}

export async function buscarAtendimento(search: string): Promise<SearchResult> {
  if (!(await getCurrentUser())) return { atendimentos: [], error: "Não autenticado" }
  const cleanQuery = search.trim()
  if (!cleanQuery) return { atendimentos: [] }

  try {
    const result = await query<AtendimentoSearchRow>(
      `SELECT a.id, a.protocolo, a.cliente_nome, a.cliente_telefone, a.observacoes,
              a.valor_cobrado, a.status, a.data_checkin,
              COALESCE(jsonb_agg(jsonb_build_object(
                'id', m.id,
                'identificacao_interna', m.identificacao_interna,
                'descricao', m.descricao,
                'status', m.status
              ) ORDER BY m.created_at) FILTER (WHERE m.id IS NOT NULL), '[]'::jsonb) AS malas
         FROM atendimentos a
         LEFT JOIN malas m ON m.atendimento_id = a.id
        WHERE a.status = 'ativo'
          AND (a.protocolo ILIKE $1 OR a.cliente_nome ILIKE $1 OR a.cliente_telefone ILIKE $2)
        GROUP BY a.id
        ORDER BY a.data_checkin DESC
        LIMIT 10`,
      [`%${cleanQuery}%`, `%${cleanQuery.replace(/\D/g, "")}%`]
    )
    return {
      atendimentos: result.rows.map((row) => ({
        ...row,
        valor_cobrado: row.valor_cobrado === null ? null : Number(row.valor_cobrado),
      })),
    }
  } catch (error) {
    console.error("Erro ao buscar atendimento:", error)
    return { atendimentos: [], error: "Erro ao buscar atendimento" }
  }
}

export interface RetiradaResult {
  success: boolean
  protocolo?: string
  cliente_nome?: string
  cliente_telefone?: string
  data_retirada?: string
  error?: string
}

export async function realizarRetirada(atendimentoId: string): Promise<RetiradaResult> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Usuário não autenticado" }

  try {
    const result = await transaction(async (client) => {
      const atendimento = await client.query<{
        protocolo: string
        cliente_nome: string
        cliente_telefone: string
        data_retirada: string
      }>(
        `UPDATE atendimentos
            SET status = 'retirado', operador_retirada_id = $2, data_retirada = CURRENT_TIMESTAMP
          WHERE id = $1 AND status = 'ativo'
        RETURNING protocolo, cliente_nome, cliente_telefone, data_retirada`,
        [atendimentoId, user.id]
      )
      if (atendimento.rowCount !== 1) throw new Error("ATENDIMENTO_NAO_ATIVO")

      await client.query(
        "UPDATE malas SET status = 'retirada' WHERE atendimento_id = $1 AND status = 'em_guarda'",
        [atendimentoId]
      )
      return atendimento.rows[0]
    })

    revalidatePath("/dashboard")
    revalidatePath("/retirada")
    return {
      success: true,
      protocolo: result.protocolo,
      cliente_nome: result.cliente_nome,
      cliente_telefone: result.cliente_telefone,
      data_retirada: result.data_retirada,
    }
  } catch (error) {
    if (error instanceof Error && error.message !== "ATENDIMENTO_NAO_ATIVO") {
      console.error("Erro ao registrar retirada:", error)
    }
    return { success: false, error: "Atendimento já retirado ou não encontrado" }
  }
}
