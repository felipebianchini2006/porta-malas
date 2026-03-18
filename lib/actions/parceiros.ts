"use server"

import { createClient } from "@/lib/supabase/server"
import type { Parceiro } from "@/lib/types"

export async function listarParceiros(): Promise<Parceiro[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("parceiros")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true })

  if (error) {
    console.error("Erro ao listar parceiros:", error)
    return []
  }

  return (data ?? []) as Parceiro[]
}

export async function criarParceiro(
  nome: string,
  tipo: string
): Promise<{ success: boolean; parceiro?: Parceiro; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("parceiros")
    .insert({ nome, tipo })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, parceiro: data as Parceiro }
}

export interface RelatorioParceiro {
  id: string
  nome: string
  tipo: string
  total_atendimentos: number
  valor_total: number
}

export async function buscarRelatorioParceiros(
  dataInicio: string,
  dataFim: string
): Promise<RelatorioParceiro[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("atendimentos")
    .select("parceiro_id, valor_cobrado, parceiro:parceiros(id, nome, tipo)")
    .not("parceiro_id", "is", null)
    .gte("data_checkin", dataInicio)
    .lte("data_checkin", dataFim + "T23:59:59")

  if (error) {
    console.error("Erro ao buscar relatório de parceiros:", error)
    return []
  }

  const agrupado = new Map<string, RelatorioParceiro>()

  for (const row of data ?? []) {
    const p = Array.isArray(row.parceiro) ? row.parceiro[0] : row.parceiro as { id: string; nome: string; tipo: string } | null
    if (!p) continue

    const existing = agrupado.get(p.id)
    if (existing) {
      existing.total_atendimentos += 1
      existing.valor_total += row.valor_cobrado ?? 0
    } else {
      agrupado.set(p.id, {
        id: p.id,
        nome: p.nome,
        tipo: p.tipo,
        total_atendimentos: 1,
        valor_total: row.valor_cobrado ?? 0,
      })
    }
  }

  return Array.from(agrupado.values()).sort((a, b) => b.valor_total - a.valor_total)
}
