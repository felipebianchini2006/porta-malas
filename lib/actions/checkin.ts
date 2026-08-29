"use server"

import { revalidatePath } from "next/cache"
import { transaction } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/session"
import { normalizarTelefone } from "@/lib/utils/telefone"
import { formaPagamentoValida, type FormaPagamento } from "@/lib/utils/payment"

export interface MalaInput {
  identificacao_interna: string
  descricao?: string
  observacoes?: string
  categoria_id?: string | null
}

export interface CheckinInput {
  cliente_nome: string
  cliente_telefone: string
  observacoes?: string
  valor_cobrado?: number
  forma_pagamento: FormaPagamento
  parceiro_id?: string | null
  malas: MalaInput[]
}

export interface CheckinResult {
  success: boolean
  atendimento_id?: string
  protocolo?: string
  error?: string
}

export async function realizarCheckin(input: CheckinInput): Promise<CheckinResult> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Usuário não autenticado" }
  if (!input.cliente_nome.trim() || !input.cliente_telefone.trim() || input.malas.length === 0) {
    return { success: false, error: "Preencha os dados do cliente e ao menos uma mala" }
  }
  if (!formaPagamentoValida(input.forma_pagamento)) {
    return { success: false, error: "Selecione uma forma de pagamento válida" }
  }

  try {
    const telefoneNormalizado = normalizarTelefone(input.cliente_telefone)
    const result = await transaction(async (client) => {
      const categoryIds = [...new Set(input.malas.flatMap((mala) => mala.categoria_id ? [mala.categoria_id] : []))]
      const categories = categoryIds.length > 0
        ? await client.query<{
            id: string
            nome: string
            preco_diaria: string
            preco_meio_periodo: string
          }>(
            `SELECT id, nome, preco_diaria, preco_meio_periodo
               FROM categorias_mala
              WHERE id = ANY($1::text[]) AND ativo = true`,
            [categoryIds]
          )
        : { rows: [] }
      const categoriesById = new Map(categories.rows.map((category) => [category.id, category]))
      if (categoriesById.size !== categoryIds.length) throw new Error("CATEGORIA_INVALIDA")

      const counter = await client.query<{ day: string; last_value: number }>(
        `INSERT INTO protocol_counters (day, last_value)
         VALUES ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date, 1)
         ON CONFLICT (day) DO UPDATE SET last_value = protocol_counters.last_value + 1
         RETURNING day::text, last_value`
      )
      const row = counter.rows[0]
      const protocolo = `${row.day.replaceAll("-", "")}-${String(row.last_value).padStart(4, "0")}`

      const atendimento = await client.query<{ id: string }>(
        `INSERT INTO atendimentos (
           protocolo, cliente_nome, cliente_telefone, observacoes, valor_cobrado, forma_pagamento,
           parceiro_id, operador_checkin_id, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ativo')
         RETURNING id`,
        [
          protocolo,
          input.cliente_nome.trim(),
          telefoneNormalizado,
          input.observacoes?.trim() || null,
          input.valor_cobrado ?? null,
          input.forma_pagamento,
          input.parceiro_id ?? null,
          user.id,
        ]
      )

      for (const mala of input.malas) {
        if (!mala.identificacao_interna.trim()) throw new Error("MALA_INVALIDA")
        const category = mala.categoria_id ? categoriesById.get(mala.categoria_id) : undefined
        await client.query(
          `INSERT INTO malas (
             atendimento_id, identificacao_interna, descricao, observacoes, status,
             categoria_id, categoria_nome, preco_diaria_aplicado, preco_meio_periodo_aplicado
           ) VALUES ($1, $2, $3, $4, 'em_guarda', $5, $6, $7, $8)`,
          [
            atendimento.rows[0].id,
            mala.identificacao_interna.trim(),
            mala.descricao?.trim() || null,
            mala.observacoes?.trim() || null,
            category?.id ?? null,
            category?.nome ?? null,
            category?.preco_diaria ?? null,
            category?.preco_meio_periodo ?? null,
          ]
        )
      }

      return { atendimentoId: atendimento.rows[0].id, protocolo }
    })

    revalidatePath("/dashboard")
    return { success: true, atendimento_id: result.atendimentoId, protocolo: result.protocolo }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Telefone")) {
      return { success: false, error: error.message }
    }
    if (error instanceof Error && error.message === "CATEGORIA_INVALIDA") {
      return { success: false, error: "Uma categoria foi desativada ou não existe mais" }
    }
    if (error instanceof Error && error.message === "MALA_INVALIDA") {
      return { success: false, error: "Cada mala precisa de uma identificação" }
    }
    console.error("Erro ao registrar check-in:", error)
    return { success: false, error: "Erro ao registrar atendimento" }
  }
}
