"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface MalaInput {
  identificacao_interna: string
  descricao?: string
  observacoes?: string
}

export interface CheckinInput {
  cliente_nome: string
  cliente_telefone: string
  observacoes?: string
  valor_cobrado?: number
  malas: MalaInput[]
}

export interface CheckinResult {
  success: boolean
  atendimento_id?: string
  protocolo?: string
  error?: string
}

export async function realizarCheckin(input: CheckinInput): Promise<CheckinResult> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Usuário não autenticado" }
  }

  // Generate protocol via RPC
  const { data: protocolo, error: protocoloError } = await supabase.rpc("gerar_protocolo")

  if (protocoloError || !protocolo) {
    return { success: false, error: "Erro ao gerar protocolo" }
  }

  // Insert atendimento
  const { data: atendimento, error: atendimentoError } = await supabase
    .from("atendimentos")
    .insert({
      protocolo,
      cliente_nome: input.cliente_nome,
      cliente_telefone: input.cliente_telefone.replace(/\D/g, ""),
      observacoes: input.observacoes || null,
      valor_cobrado: input.valor_cobrado || null,
      operador_checkin_id: user.id,
      status: "ativo",
    })
    .select()
    .single()

  if (atendimentoError || !atendimento) {
    return { success: false, error: "Erro ao registrar atendimento" }
  }

  // Insert malas
  if (input.malas.length > 0) {
    const malasData = input.malas.map((mala) => ({
      atendimento_id: atendimento.id,
      identificacao_interna: mala.identificacao_interna,
      descricao: mala.descricao || null,
      observacoes: mala.observacoes || null,
      status: "em_guarda" as const,
    }))

    const { error: malasError } = await supabase.from("malas").insert(malasData)

    if (malasError) {
      return { success: false, error: "Erro ao registrar malas" }
    }
  }

  revalidatePath("/dashboard")
  return { success: true, atendimento_id: atendimento.id, protocolo }
}
