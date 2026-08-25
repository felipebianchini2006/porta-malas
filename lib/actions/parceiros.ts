"use server"

import { getCurrentUser } from "@/lib/auth/session"
import { query } from "@/lib/db"
import type { Parceiro, TipoParceiro } from "@/lib/types"

export async function listarParceiros(): Promise<Parceiro[]> {
  if (!(await getCurrentUser())) return []
  try {
    const result = await query<Parceiro>(
      "SELECT id, nome, tipo, ativo, created_at FROM parceiros WHERE ativo = true ORDER BY nome"
    )
    return result.rows
  } catch (error) {
    console.error("Erro ao listar parceiros:", error)
    return []
  }
}

export async function criarParceiro(
  nome: string,
  tipo: string
): Promise<{ success: boolean; parceiro?: Parceiro; error?: string }> {
  if (!(await getCurrentUser())) return { success: false, error: "Não autenticado" }
  const allowed: TipoParceiro[] = ["Hotel", "Airbnb", "Hostel", "Rua", "Outro"]
  if (!allowed.includes(tipo as TipoParceiro)) return { success: false, error: "Tipo de parceiro inválido" }
  try {
    const result = await query<Parceiro>(
      `INSERT INTO parceiros (nome, tipo) VALUES ($1, $2)
       RETURNING id, nome, tipo, ativo, created_at`,
      [nome.trim(), tipo]
    )
    return { success: true, parceiro: result.rows[0] }
  } catch (error) {
    console.error("Erro ao criar parceiro:", error)
    return { success: false, error: "Erro ao criar parceiro" }
  }
}

export interface RelatorioParceiro {
  id: string
  nome: string
  tipo: string
  total_atendimentos: number
  valor_total: number
}

interface RelatorioParceiroRow extends Omit<RelatorioParceiro, "total_atendimentos" | "valor_total"> {
  total_atendimentos: string
  valor_total: string
}

export async function buscarRelatorioParceiros(dataInicio: string, dataFim: string): Promise<RelatorioParceiro[]> {
  if (!(await getCurrentUser())) return []
  try {
    const result = await query<RelatorioParceiroRow>(
      `SELECT p.id, p.nome, p.tipo, count(a.id) AS total_atendimentos,
              COALESCE(sum(a.valor_cobrado), 0) AS valor_total
         FROM parceiros p
         JOIN atendimentos a ON a.parceiro_id = p.id
        WHERE a.data_checkin >= ($1::date::timestamp AT TIME ZONE 'America/Sao_Paulo')
          AND a.data_checkin < (($2::date + 1)::timestamp AT TIME ZONE 'America/Sao_Paulo')
        GROUP BY p.id, p.nome, p.tipo
        ORDER BY valor_total DESC`,
      [dataInicio, dataFim]
    )
    return result.rows.map((row) => ({
      ...row,
      total_atendimentos: Number(row.total_atendimentos),
      valor_total: Number(row.valor_total),
    }))
  } catch (error) {
    console.error("Erro ao buscar relatório de parceiros:", error)
    return []
  }
}
