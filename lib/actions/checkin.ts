"use server"

import { revalidatePath } from "next/cache"
import { transaction } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/session"

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

  try {
    const result = await transaction(async (client) => {
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
           protocolo, cliente_nome, cliente_telefone, observacoes, valor_cobrado,
           parceiro_id, operador_checkin_id, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ativo')
         RETURNING id`,
        [
          protocolo,
          input.cliente_nome.trim(),
          input.cliente_telefone.replace(/\D/g, ""),
          input.observacoes?.trim() || null,
          input.valor_cobrado ?? null,
          input.parceiro_id ?? null,
          user.id,
        ]
      )

      for (const mala of input.malas) {
        await client.query(
          `INSERT INTO malas (atendimento_id, identificacao_interna, descricao, observacoes, status)
           VALUES ($1, $2, $3, $4, 'em_guarda')`,
          [
            atendimento.rows[0].id,
            mala.identificacao_interna.trim(),
            mala.descricao?.trim() || null,
            mala.observacoes?.trim() || null,
          ]
        )
      }

      return { atendimentoId: atendimento.rows[0].id, protocolo }
    })

    revalidatePath("/dashboard")
    return { success: true, atendimento_id: result.atendimentoId, protocolo: result.protocolo }
  } catch (error) {
    console.error("Erro ao registrar check-in:", error)
    return { success: false, error: "Erro ao registrar atendimento" }
  }
}
