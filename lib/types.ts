import type { FormaPagamento } from "@/lib/utils/payment"

export type UserRole = "admin" | "operador"
export type TipoParceiro = "Hotel" | "Airbnb" | "Hostel" | "Rua" | "Outro"
export type GrupoParceiro = "Hospedagem" | "Indicação Local"
export type StatusParceiro = "pendente_cadastro" | "pendente_financeiro" | "ativo" | "inativo" | "bloqueado"

export interface Parceiro {
  id: string
  nome: string
  tipo: TipoParceiro
  grupo: GrupoParceiro
  categoria: string
  codigo_indicacao: string
  desconto_percentual: number
  comissao_percentual: number
  dia_repasse: number
  status: StatusParceiro
  ativo: boolean
  created_at: string
}
export type StatusAtendimento = "ativo" | "retirado"
export type StatusMala = "em_guarda" | "retirada"

export interface Usuario {
  id: string
  nome: string
  email?: string | null
  role: UserRole
  ativo: boolean
  created_at: string
}

export interface Atendimento {
  id: string
  protocolo: string
  cliente_nome: string
  cliente_telefone: string
  cliente_documento_tipo?: "CPF" | "Passaporte" | null
  cliente_documento?: string | null
  observacoes: string | null
  valor_cobrado: number | null
  forma_pagamento: FormaPagamento | null
  status: StatusAtendimento
  operador_checkin_id: string
  operador_retirada_id: string | null
  data_checkin: string
  data_retirada: string | null
  created_at: string
  parceiro_id?: string | null
  valor_bruto?: number | null
  desconto_percentual_aplicado?: number | null
  desconto_valor?: number | null
  comissao_percentual_aplicada?: number | null
  comissao_valor?: number | null
  valor_liquido_bagpoint?: number | null
  competencia?: string | null
  aceite_token?: string | null
  aceite_em?: string | null
  // relations
  operador_checkin?: Usuario
  operador_retirada?: Usuario
  malas?: Mala[]
  parceiro?: Parceiro
}

export interface Mala {
  id: string
  atendimento_id: string
  identificacao_interna: string
  descricao: string | null
  status: StatusMala
  observacoes: string | null
  categoria_id?: string | null
  categoria_nome?: string | null
  preco_diaria_aplicado?: number | null
  preco_meio_periodo_aplicado?: number | null
  created_at: string
  // relations
  fotos?: FotoMala[]
}

export interface FotoMala {
  id: string
  mala_id: string
  storage_path: string
  url: string
  created_at: string
}

export interface AtendimentoStats {
  total_ativo: number
  entradas_hoje: number
  retiradas_hoje: number
  ocupacao_percentual: number
}
