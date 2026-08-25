export type UserRole = "admin" | "operador"
export type TipoParceiro = "Hotel" | "Airbnb" | "Hostel" | "Rua" | "Outro"

export interface Parceiro {
  id: string
  nome: string
  tipo: TipoParceiro
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
  observacoes: string | null
  valor_cobrado: number | null
  status: StatusAtendimento
  operador_checkin_id: string
  operador_retirada_id: string | null
  data_checkin: string
  data_retirada: string | null
  created_at: string
  parceiro_id?: string | null
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
