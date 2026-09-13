"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth/session"
import { query, transaction } from "@/lib/db"
import type { GrupoParceiro } from "@/lib/types"
import type { StatusRepasse } from "@/lib/utils/partner-program"

export interface Repasse {
  id: string
  parceiro_id: string
  parceiro_nome: string
  codigo_indicacao: string
  grupo: GrupoParceiro
  categoria: string
  pix_tipo: string | null
  pix_chave: string | null
  pix_titular: string | null
  competencia: string
  quantidade_atendimentos: number
  quantidade_malas: number
  valor_bruto: number
  desconto_total: number
  comissao_total: number
  valor_liquido_bagpoint: number
  vencimento: string
  dias_restantes: number
  status: StatusRepasse
  data_pagamento: string | null
  comprovante: string | null
}

type RepasseRow = Omit<Repasse, "quantidade_atendimentos" | "quantidade_malas" | "valor_bruto" | "desconto_total" | "comissao_total" | "valor_liquido_bagpoint" | "dias_restantes"> & {
  quantidade_atendimentos: string
  quantidade_malas: string
  valor_bruto: string
  desconto_total: string
  comissao_total: string
  valor_liquido_bagpoint: string
  dias_restantes: string
}

function competenciaDate(competencia: string): string | null {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(competencia) ? `${competencia}-01` : null
}

function mapRepasse(row: RepasseRow): Repasse {
  return {
    ...row,
    quantidade_atendimentos: Number(row.quantidade_atendimentos),
    quantidade_malas: Number(row.quantidade_malas),
    valor_bruto: Number(row.valor_bruto),
    desconto_total: Number(row.desconto_total),
    comissao_total: Number(row.comissao_total),
    valor_liquido_bagpoint: Number(row.valor_liquido_bagpoint),
    dias_restantes: Number(row.dias_restantes),
  }
}

export async function listarRepasses(competencia: string): Promise<Repasse[]> {
  await requireAdmin()
  const data = competenciaDate(competencia)
  if (!data) return []

  await transaction(async (client) => {
    await client.query(
      `INSERT INTO repasses (
         parceiro_id, competencia, quantidade_atendimentos, quantidade_malas,
         valor_bruto, desconto_total, comissao_total, valor_liquido_bagpoint, vencimento
       )
       SELECT p.id, $1::date, count(a.id), COALESCE(sum(a.qtd_malas), 0),
              COALESCE(sum(a.valor_bruto), 0), COALESCE(sum(a.desconto_valor), 0),
              COALESCE(sum(a.comissao_valor), 0), COALESCE(sum(a.valor_liquido_bagpoint), 0),
              (
                (($1::date + interval '1 month')::date + (p.dia_repasse - 1))
                + CASE EXTRACT(ISODOW FROM (($1::date + interval '1 month')::date + (p.dia_repasse - 1)))
                    WHEN 6 THEN 2 WHEN 7 THEN 1 ELSE 0 END
              )::date
         FROM parceiros p
         JOIN (
           SELECT a.id, a.parceiro_id, a.valor_bruto, a.desconto_valor,
                  a.comissao_valor, a.valor_liquido_bagpoint,
                  (SELECT count(*) FROM malas m WHERE m.atendimento_id = a.id) AS qtd_malas
             FROM atendimentos a
            WHERE a.competencia = $1::date
              AND a.parceiro_id IS NOT NULL
              AND COALESCE(a.comissao_valor, 0) > 0
         ) a ON a.parceiro_id = p.id
        GROUP BY p.id
       ON CONFLICT (parceiro_id, competencia) DO UPDATE SET
         quantidade_atendimentos = EXCLUDED.quantidade_atendimentos,
         quantidade_malas = EXCLUDED.quantidade_malas,
         valor_bruto = EXCLUDED.valor_bruto,
         desconto_total = EXCLUDED.desconto_total,
         comissao_total = EXCLUDED.comissao_total,
         valor_liquido_bagpoint = EXCLUDED.valor_liquido_bagpoint,
         vencimento = EXCLUDED.vencimento,
         updated_at = CURRENT_TIMESTAMP
       WHERE repasses.status <> 'pago'`,
      [data]
    )
    await client.query(
      `UPDATE repasses
          SET status = 'vencido', updated_at = CURRENT_TIMESTAMP
        WHERE competencia = $1::date AND vencimento < CURRENT_DATE
          AND status IN ('em_aberto', 'programado')`,
      [data]
    )
  })

  const result = await query<RepasseRow>(
    `SELECT r.id, r.parceiro_id, p.nome AS parceiro_nome, p.codigo_indicacao,
            p.grupo, p.categoria, p.pix_tipo, p.pix_chave, p.pix_titular,
            r.competencia::text, r.quantidade_atendimentos, r.quantidade_malas,
            r.valor_bruto, r.desconto_total, r.comissao_total, r.valor_liquido_bagpoint,
            r.vencimento::text, (r.vencimento - CURRENT_DATE)::text AS dias_restantes,
            r.status, r.data_pagamento, r.comprovante_referencia AS comprovante
       FROM repasses r
       JOIN parceiros p ON p.id = r.parceiro_id
      WHERE r.competencia = $1::date
      ORDER BY r.vencimento, p.nome`,
    [data]
  )
  return result.rows.map(mapRepasse)
}

export async function atualizarRepasse(
  id: string,
  status: StatusRepasse,
  comprovante?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAdmin()
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { success: false, error: "Repasse inválido" }
    if (!["em_aberto", "programado", "pago", "vencido", "bloqueado"].includes(status)) {
      return { success: false, error: "Status inválido" }
    }
    if (status === "pago" && !comprovante?.trim()) return { success: false, error: "Informe a referência do comprovante" }
    const updated = await transaction(async (client) => {
      const before = await client.query<{ status: StatusRepasse; comprovante_referencia: string | null }>(
        "SELECT status, comprovante_referencia FROM repasses WHERE id = $1 FOR UPDATE",
        [id]
      )
      if (!before.rows[0]) return false
      const referencia = comprovante?.trim() || null
      if (before.rows[0].status === status && (status !== "pago" || before.rows[0].comprovante_referencia === referencia)) {
        return true
      }
      await client.query(
        `UPDATE repasses
            SET status = $2,
                data_pagamento = CASE WHEN $2 = 'pago' THEN COALESCE(data_pagamento, CURRENT_TIMESTAMP) ELSE NULL END,
                comprovante_referencia = CASE WHEN $2 = 'pago' THEN $3 ELSE comprovante_referencia END,
                updated_at = CURRENT_TIMESTAMP
          WHERE id = $1`,
        [id, status, referencia]
      )
      await client.query(
        `INSERT INTO repasse_eventos
           (repasse_id, usuario_id, status_anterior, status_novo, comprovante_referencia)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, user.id, before.rows[0].status, status, referencia]
      )
      return true
    })
    if (!updated) return { success: false, error: "Repasse não encontrado" }
    revalidatePath("/admin/repasses")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar repasse:", error)
    return { success: false, error: error instanceof Error && error.message === "Sem permissão" ? error.message : "Não foi possível atualizar o repasse" }
  }
}

export interface IndicacaoParceiro {
  id: string
  protocolo: string
  data_checkin: string
  quantidade_malas: number
  valor_bruto: number
  desconto_valor: number
  comissao_valor: number
  valor_liquido_bagpoint: number
  competencia: string
  aceite_em: string | null
}

type IndicacaoRow = Omit<IndicacaoParceiro, "quantidade_malas" | "valor_bruto" | "desconto_valor" | "comissao_valor" | "valor_liquido_bagpoint"> & {
  quantidade_malas: string
  valor_bruto: string
  desconto_valor: string
  comissao_valor: string
  valor_liquido_bagpoint: string
}

export async function listarIndicacoesParceiro(parceiroId: string): Promise<IndicacaoParceiro[]> {
  await requireAdmin()
  if (!/^[0-9a-f-]{36}$/i.test(parceiroId)) return []
  const result = await query<IndicacaoRow>(
    `SELECT a.id, a.protocolo, a.data_checkin, count(m.id)::text AS quantidade_malas,
            COALESCE(a.valor_bruto, 0)::text AS valor_bruto,
            COALESCE(a.desconto_valor, 0)::text AS desconto_valor,
            COALESCE(a.comissao_valor, 0)::text AS comissao_valor,
            COALESCE(a.valor_liquido_bagpoint, 0)::text AS valor_liquido_bagpoint,
            a.competencia::text, a.aceite_em
       FROM atendimentos a
       JOIN malas m ON m.atendimento_id = a.id
      WHERE a.parceiro_id = $1
      GROUP BY a.id
      ORDER BY a.data_checkin DESC`,
    [parceiroId]
  )
  return result.rows.map((row) => ({
    ...row,
    quantidade_malas: Number(row.quantidade_malas),
    valor_bruto: Number(row.valor_bruto),
    desconto_valor: Number(row.desconto_valor),
    comissao_valor: Number(row.comissao_valor),
    valor_liquido_bagpoint: Number(row.valor_liquido_bagpoint),
  }))
}
