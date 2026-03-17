"use server"

import { createClient } from "@/lib/supabase/server"

export interface RelatorioData {
  atendimentos: RelatorioAtendimento[]
  stats: {
    total: number
    entradas: number
    retiradas: number
    em_guarda: number
    valor_total: number
  }
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

export async function buscarRelatorio(dataInicio: string, dataFim: string): Promise<RelatorioData> {
  const supabase = await createClient()

  // Convert date strings to ISO format (inclusive range)
  const inicio = new Date(dataInicio)
  inicio.setHours(0, 0, 0, 0)

  const fim = new Date(dataFim)
  fim.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from("atendimentos")
    .select(`
      id,
      protocolo,
      cliente_nome,
      cliente_telefone,
      valor_cobrado,
      status,
      data_checkin,
      data_retirada,
      malas(id)
    `)
    .gte("data_checkin", inicio.toISOString())
    .lte("data_checkin", fim.toISOString())
    .order("data_checkin", { ascending: false })

  if (error || !data) {
    return {
      atendimentos: [],
      stats: { total: 0, entradas: 0, retiradas: 0, em_guarda: 0, valor_total: 0 },
    }
  }

  const atendimentos: RelatorioAtendimento[] = data.map((a: any) => ({
    id: a.id,
    protocolo: a.protocolo,
    cliente_nome: a.cliente_nome,
    cliente_telefone: a.cliente_telefone,
    valor_cobrado: a.valor_cobrado,
    status: a.status,
    data_checkin: a.data_checkin,
    data_retirada: a.data_retirada,
    qtd_malas: Array.isArray(a.malas) ? a.malas.length : 0,
  }))

  const stats = {
    total: atendimentos.length,
    entradas: atendimentos.length,
    retiradas: atendimentos.filter((a) => a.status === "retirado").length,
    em_guarda: atendimentos.filter((a) => a.status === "ativo").length,
    valor_total: atendimentos.reduce((sum, a) => sum + (a.valor_cobrado || 0), 0),
  }

  return { atendimentos, stats }
}
