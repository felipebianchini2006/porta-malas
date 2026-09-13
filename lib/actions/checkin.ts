"use server"

import { randomBytes } from "node:crypto"
import { revalidatePath } from "next/cache"
import { transaction } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/session"
import { normalizarTelefone } from "@/lib/utils/telefone"
import { formaPagamentoValida, type FormaPagamento } from "@/lib/utils/payment"
import { calcularProgramaParceiro } from "@/lib/utils/partner-program"

export interface MalaInput {
  identificacao_interna: string
  descricao?: string
  observacoes?: string
  categoria_id?: string | null
}

export interface CheckinInput {
  cliente_nome: string
  cliente_documento_tipo: "CPF" | "Passaporte"
  cliente_documento: string
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
  if (!input.cliente_nome.trim() || !input.cliente_documento.trim() || !input.cliente_telefone.trim() || input.malas.length === 0) {
    return { success: false, error: "Nome, CPF/passaporte, WhatsApp e ao menos uma mala são obrigatórios" }
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
      const parceiro = input.parceiro_id
        ? await client.query<{
            id: string
            desconto_percentual: string
            comissao_percentual: string
          }>(
            `SELECT id, desconto_percentual, comissao_percentual
               FROM parceiros
              WHERE id = $1 AND ativo = true AND status = 'ativo'`,
            [input.parceiro_id]
          )
        : null
      if (input.parceiro_id && !parceiro?.rows[0]) throw new Error("PARCEIRO_INVALIDO")
      if (parceiro && input.malas.some((mala) => !mala.categoria_id)) {
        throw new Error("CATEGORIA_OBRIGATORIA_PARCEIRO")
      }

      const valorBaseCategorias = input.malas.reduce((total, mala) => {
        const category = mala.categoria_id ? categoriesById.get(mala.categoria_id) : undefined
        return total + Number(category?.preco_diaria ?? 0)
      }, 0)
      const regraParceiro = parceiro?.rows[0]
      const calculoParceiro = regraParceiro
        ? calcularProgramaParceiro({
            valorBase: valorBaseCategorias,
            descontoPercentual: Number(regraParceiro.desconto_percentual),
            comissaoPercentual: Number(regraParceiro.comissao_percentual),
          })
        : null
      const aceiteToken = randomBytes(24).toString("base64url")

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
           protocolo, cliente_nome, cliente_documento_tipo, cliente_documento, cliente_telefone,
           observacoes, valor_cobrado, forma_pagamento, parceiro_id, operador_checkin_id, status,
           valor_bruto, desconto_percentual_aplicado, desconto_valor,
           comissao_percentual_aplicada, comissao_valor, valor_liquido_bagpoint,
           competencia, aceite_token
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ativo',
                   $11, $12, $13, $14, $15, $16,
                   date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date, $17)
         RETURNING id`,
        [
          protocolo,
          input.cliente_nome.trim(),
          input.cliente_documento_tipo,
          input.cliente_documento.trim(),
          telefoneNormalizado,
          input.observacoes?.trim() || null,
          calculoParceiro?.valorCobrado ?? input.valor_cobrado ?? null,
          input.forma_pagamento,
          input.parceiro_id ?? null,
          user.id,
          calculoParceiro?.valorBruto ?? input.valor_cobrado ?? null,
          regraParceiro ? Number(regraParceiro.desconto_percentual) : 0,
          calculoParceiro?.descontoValor ?? 0,
          regraParceiro ? Number(regraParceiro.comissao_percentual) : 0,
          calculoParceiro?.comissaoValor ?? 0,
          calculoParceiro?.valorLiquidoBagpoint ?? input.valor_cobrado ?? null,
          aceiteToken,
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
    if (error instanceof Error && error.message === "PARCEIRO_INVALIDO") {
      return { success: false, error: "O parceiro foi desativado ou não existe mais" }
    }
    if (error instanceof Error && error.message === "CATEGORIA_OBRIGATORIA_PARCEIRO") {
      return { success: false, error: "Selecione a categoria de todas as malas para aplicar o programa de parceiros" }
    }
    if (error instanceof Error && error.message === "MALA_INVALIDA") {
      return { success: false, error: "Informe o lacre de todas as malas" }
    }
    console.error("Erro ao registrar check-in:", error)
    return { success: false, error: "Erro ao registrar atendimento" }
  }
}
