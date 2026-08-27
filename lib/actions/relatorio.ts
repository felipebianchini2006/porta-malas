"use server"

import { getCurrentUser } from "@/lib/auth/session"
import { query } from "@/lib/db"

export interface RelatorioData {
  atendimentos: RelatorioAtendimento[]
  stats: { total: number; entradas: number; retiradas: number; em_guarda: number; valor_total: number }
  can_delete: boolean
}

export interface RelatorioAtendimento {
  id: string
  protocolo: string
  cliente_nome: string
  cliente_telefone: string
  valor_cobrado: number | null
  status: string
  data_checkin: string
  data_retirada: string | null
  qtd_malas: number
}

interface RelatorioRow extends Omit<RelatorioAtendimento, "valor_cobrado" | "qtd_malas"> {
  valor_cobrado: string | null
  qtd_malas: string
}

const EMPTY: RelatorioData = {
  atendimentos: [],
  stats: { total: 0, entradas: 0, retiradas: 0, em_guarda: 0, valor_total: 0 },
  can_delete: false,
}

export async function buscarRelatorio(dataInicio: string, dataFim: string): Promise<RelatorioData> {
  const user = await getCurrentUser()
  if (!user) return EMPTY
  const canDelete =
    user.role === "admin" && process.env.ENABLE_ATENDIMENTO_DELETE === "true"
  try {
    const result = await query<RelatorioRow>(
      `SELECT a.id, a.protocolo, a.cliente_nome, a.cliente_telefone, a.valor_cobrado,
              a.status, a.data_checkin, a.data_retirada, count(m.id) AS qtd_malas
         FROM atendimentos a
         LEFT JOIN malas m ON m.atendimento_id = a.id
        WHERE a.data_checkin >= ($1::date::timestamp AT TIME ZONE 'America/Sao_Paulo')
          AND a.data_checkin < (($2::date + 1)::timestamp AT TIME ZONE 'America/Sao_Paulo')
        GROUP BY a.id
        ORDER BY a.data_checkin DESC`,
      [dataInicio, dataFim]
    )
    const atendimentos = result.rows.map((row) => ({
      ...row,
      valor_cobrado: row.valor_cobrado === null ? null : Number(row.valor_cobrado),
      qtd_malas: Number(row.qtd_malas),
    }))
    return {
      atendimentos,
      stats: {
        total: atendimentos.length,
        entradas: atendimentos.length,
        retiradas: atendimentos.filter((item) => item.status === "retirado").length,
        em_guarda: atendimentos.filter((item) => item.status === "ativo").length,
        valor_total: atendimentos.reduce((sum, item) => sum + (item.valor_cobrado ?? 0), 0),
      },
      can_delete: canDelete,
    }
  } catch (error) {
    console.error("Erro ao buscar relatório:", error)
    return { ...EMPTY, can_delete: canDelete }
  }
}
