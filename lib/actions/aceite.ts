"use server"

import { revalidatePath } from "next/cache"

import { query } from "@/lib/db"

export interface AtendimentoAceite {
  protocolo: string
  cliente_nome: string
  quantidade_malas: number
  aceite_versao: string
  aceite_em: string | null
}

type AtendimentoAceiteRow = Omit<AtendimentoAceite, "quantidade_malas"> & {
  quantidade_malas: string
}

function tokenValido(token: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(token)
}

export async function buscarAtendimentoAceite(token: string): Promise<AtendimentoAceite | null> {
  if (!tokenValido(token)) return null
  const result = await query<AtendimentoAceiteRow>(
    `SELECT a.protocolo, a.cliente_nome, a.aceite_versao, a.aceite_em,
            count(m.id)::text AS quantidade_malas
       FROM atendimentos a
       JOIN malas m ON m.atendimento_id = a.id
      WHERE a.aceite_token = $1
      GROUP BY a.id`,
    [token]
  )
  const row = result.rows[0]
  return row ? { ...row, quantidade_malas: Number(row.quantidade_malas) } : null
}

export async function registrarAceite(token: string): Promise<{ success: boolean; acceptedAt?: string; error?: string }> {
  if (!tokenValido(token)) return { success: false, error: "Link de aceite inválido" }
  try {
    const result = await query<{ aceite_em: string }>(
      `UPDATE atendimentos
          SET aceite_em = COALESCE(aceite_em, CURRENT_TIMESTAMP)
        WHERE aceite_token = $1
      RETURNING aceite_em`,
      [token]
    )
    if (!result.rows[0]) return { success: false, error: "Check-in não encontrado" }
    revalidatePath(`/aceite/${token}`)
    return { success: true, acceptedAt: result.rows[0].aceite_em }
  } catch (error) {
    console.error("Erro ao registrar aceite:", error)
    return { success: false, error: "Não foi possível registrar o aceite" }
  }
}
