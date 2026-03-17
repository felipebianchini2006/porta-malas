export type UserRole = "admin" | "operador"
export type StatusAtendimento = "ativo" | "retirado"
export type StatusMala = "em_guarda" | "retirada"

export interface Usuario {
  id: string
  nome: string
  role: UserRole
  ativo: boolean
  created_at: string
}

export interface Atendimento {
  id: string
  protocolo: string
  cliente_nome: string
  cliente_telefone: string
  observacoes: string | null
  valor_cobrado: number | null
  status: StatusAtendimento
  operador_checkin_id: string
  operador_retirada_id: string | null
  data_checkin: string
  data_retirada: string | null
  created_at: string
  // relations
  operador_checkin?: Usuario
  operador_retirada?: Usuario
  malas?: Mala[]
}

export interface Mala {
  id: string
  atendimento_id: string
  identificacao_interna: string
  descricao: string | null
  status: StatusMala
  observacoes: string | null
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
