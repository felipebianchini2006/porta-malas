"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
  malas: {
    id: string
    identificacao_interna: string
    descricao: string | null
    status: string
  }[]
}

export async function buscarAtendimento(query: string): Promise<SearchResult> {
  const supabase = await createClient()

  const cleanQuery = query.trim()
  if (!cleanQuery) return { atendimentos: [] }

  // Search by protocol, name, or phone
  const { data, error } = await supabase
    .from("atendimentos")
    .select(`
      id,
      protocolo,
      cliente_nome,
      cliente_telefone,
      observacoes,
      valor_cobrado,
      status,
      data_checkin,
      malas(id, identificacao_interna, descricao, status)
    `)
    .or(`protocolo.ilike.%${cleanQuery}%,cliente_nome.ilike.%${cleanQuery}%,cliente_telefone.ilike.%${cleanQuery.replace(/\D/g, "")}%`)
    .eq("status", "ativo")
    .order("data_checkin", { ascending: false })
    .limit(10)

  if (error) {
    return { atendimentos: [], error: error.message }
  }

  return { atendimentos: (data as AtendimentoComMalas[]) || [] }
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
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Usuário não autenticado" }
  }

  const dataRetirada = new Date().toISOString()

  // Update atendimento
  const { data: atendimento, error: atendimentoError } = await supabase
    .from("atendimentos")
    .update({
      status: "retirado",
      operador_retirada_id: user.id,
      data_retirada: dataRetirada,
    })
    .eq("id", atendimentoId)
    .eq("status", "ativo") // Prevent double-retirada
    .select("protocolo, cliente_nome, cliente_telefone")
    .single()

  if (atendimentoError || !atendimento) {
    return { success: false, error: "Erro ao registrar retirada" }
  }

  // Update all malas
  await supabase
    .from("malas")
    .update({ status: "retirada" })
    .eq("atendimento_id", atendimentoId)

  revalidatePath("/dashboard")
  revalidatePath("/retirada")

  return {
    success: true,
    protocolo: atendimento.protocolo,
    cliente_nome: atendimento.cliente_nome,
    cliente_telefone: atendimento.cliente_telefone,
    data_retirada: dataRetirada,
  }
}
