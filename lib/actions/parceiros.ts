"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getCurrentUser, requireAdmin } from "@/lib/auth/session"
import { query, transaction } from "@/lib/db"
import type { GrupoParceiro, Parceiro, StatusParceiro, TipoParceiro } from "@/lib/types"
import { gerarCodigoIndicacao } from "@/lib/utils/partner-program"

export interface ParceiroDetalhado extends Parceiro {
  nome_completo_razao_social: string | null
  nome_fantasia: string | null
  pessoa_tipo: "PF" | "PJ" | null
  documento: string | null
  whatsapp: string | null
  email: string | null
  instagram: string | null
  site: string | null
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  cep: string | null
  data_inicio: string
  pix_tipo: string | null
  pix_chave: string | null
  pix_titular: string | null
  pix_documento_titular: string | null
  observacoes: string | null
  nome_airbnb: string | null
  quantidade_unidades: number | null
  bairros_atendidos: string | null
  empresa_gestora: string | null
  updated_at: string
}

export interface ParceiroInput {
  nome: string
  nome_completo_razao_social?: string
  nome_fantasia?: string
  pessoa_tipo?: "PF" | "PJ" | ""
  documento?: string
  grupo: GrupoParceiro
  categoria: string
  whatsapp?: string
  email?: string
  instagram?: string
  site?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  cep?: string
  codigo_indicacao?: string
  desconto_percentual: number
  comissao_percentual: number
  dia_repasse: number
  pix_tipo?: string
  pix_chave?: string
  pix_titular?: string
  pix_documento_titular?: string
  status: StatusParceiro
  observacoes?: string
  nome_airbnb?: string
  quantidade_unidades?: number | null
  bairros_atendidos?: string
  empresa_gestora?: string
}

type ParceiroRow = Omit<ParceiroDetalhado, "desconto_percentual" | "comissao_percentual"> & {
  desconto_percentual: string
  comissao_percentual: string
}

const optionalText = (max: number) => z.string().trim().max(max).optional().default("")
const parceiroSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(120),
  nome_completo_razao_social: optionalText(180),
  nome_fantasia: optionalText(160),
  pessoa_tipo: z.enum(["PF", "PJ", ""]).optional().default(""),
  documento: optionalText(30),
  grupo: z.enum(["Hospedagem", "Indicação Local"]),
  categoria: z.string().trim().min(2, "Categoria obrigatória").max(80),
  whatsapp: optionalText(30),
  email: z.union([z.string().trim().email("E-mail inválido"), z.literal("")]).optional().default(""),
  instagram: optionalText(120),
  site: optionalText(240),
  endereco: optionalText(180),
  numero: optionalText(30),
  complemento: optionalText(100),
  bairro: optionalText(100),
  cidade: optionalText(100),
  uf: optionalText(2),
  cep: optionalText(12),
  codigo_indicacao: optionalText(48),
  desconto_percentual: z.number().finite().min(0).max(100),
  comissao_percentual: z.number().finite().min(0).max(100),
  dia_repasse: z.number().int().min(1).max(28),
  pix_tipo: optionalText(40),
  pix_chave: optionalText(180),
  pix_titular: optionalText(180),
  pix_documento_titular: optionalText(30),
  status: z.enum(["pendente_cadastro", "pendente_financeiro", "ativo", "inativo", "bloqueado"]),
  observacoes: optionalText(1000),
  nome_airbnb: optionalText(180),
  quantidade_unidades: z.number().int().min(0).max(100_000).nullable().optional(),
  bairros_atendidos: optionalText(500),
  empresa_gestora: optionalText(180),
})

function mapParceiro(row: ParceiroRow): ParceiroDetalhado {
  return {
    ...row,
    desconto_percentual: Number(row.desconto_percentual),
    comissao_percentual: Number(row.comissao_percentual),
  }
}

function tipoLegado(input: ParceiroInput): TipoParceiro {
  if (input.grupo === "Indicação Local") return "Rua"
  if (["Hotel", "Airbnb", "Hostel"].includes(input.categoria)) return input.categoria as TipoParceiro
  return "Outro"
}

function nullable(value: string | undefined): string | null {
  return value?.trim() || null
}

function revalidateParceiros() {
  revalidatePath("/checkin")
  revalidatePath("/admin/parceiros")
  revalidatePath("/admin/repasses")
  revalidatePath("/relatorio/parceiros")
}

const PARCEIRO_COLUMNS = `
  id, nome, tipo, grupo, categoria, nome_completo_razao_social, nome_fantasia,
  pessoa_tipo, documento, whatsapp, email, instagram, site, endereco, numero,
  complemento, bairro, cidade, uf, cep, codigo_indicacao, data_inicio,
  desconto_percentual, comissao_percentual, dia_repasse, pix_tipo, pix_chave,
  pix_titular, pix_documento_titular, status, observacoes, nome_airbnb,
  quantidade_unidades, bairros_atendidos, empresa_gestora, ativo, created_at, updated_at`

export async function listarParceiros(): Promise<Parceiro[]> {
  if (!(await getCurrentUser())) return []
  try {
    const result = await query<ParceiroRow>(
      `SELECT ${PARCEIRO_COLUMNS}
         FROM parceiros
        WHERE ativo = true AND status = 'ativo'
        ORDER BY nome`
    )
    return result.rows.map(mapParceiro)
  } catch (error) {
    console.error("Erro ao listar parceiros:", error)
    return []
  }
}

export async function listarParceirosAdmin(): Promise<ParceiroDetalhado[]> {
  try {
    await requireAdmin()
    const result = await query<ParceiroRow>(`SELECT ${PARCEIRO_COLUMNS} FROM parceiros ORDER BY nome`)
    return result.rows.map(mapParceiro)
  } catch (error) {
    console.error("Erro ao listar parceiros para administração:", error)
    return []
  }
}

export async function buscarParceiroAdmin(id: string): Promise<ParceiroDetalhado | null> {
  try {
    await requireAdmin()
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null
    const result = await query<ParceiroRow>(
      `SELECT ${PARCEIRO_COLUMNS} FROM parceiros WHERE id = $1`,
      [id]
    )
    return result.rows[0] ? mapParceiro(result.rows[0]) : null
  } catch (error) {
    console.error("Erro ao buscar parceiro:", error)
    return null
  }
}

export async function criarParceiro(
  nome: string,
  tipo: string
): Promise<{ success: boolean; parceiro?: Parceiro; error?: string }> {
  try {
    await requireAdmin()
    const grupo: GrupoParceiro = ["Hotel", "Airbnb", "Hostel"].includes(tipo)
      ? "Hospedagem"
      : "Indicação Local"
    return salvarParceiro({
      nome,
      grupo,
      categoria: tipo,
      desconto_percentual: 5,
      comissao_percentual: 5,
      dia_repasse: grupo === "Hospedagem" ? 20 : 15,
      status: "pendente_financeiro",
    })
  } catch (error) {
    return mutationError(error, "Erro ao criar parceiro")
  }
}

export async function salvarParceiro(
  input: ParceiroInput,
  id?: string
): Promise<{ success: boolean; parceiro?: ParceiroDetalhado; error?: string }> {
  try {
    const user = await requireAdmin()
    const parsed = parceiroSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos" }
    const value = parsed.data
    const baseCodigo = nullable(value.codigo_indicacao) || gerarCodigoIndicacao(value.grupo, value.nome)
    const codigo = baseCodigo.toUpperCase()
    const ativo = value.status === "ativo"

    const parceiro = await transaction(async (client) => {
      const before = id
        ? await client.query<ParceiroRow>(`SELECT ${PARCEIRO_COLUMNS} FROM parceiros WHERE id = $1`, [id])
        : null
      const params = [
        value.nome,
        tipoLegado(value),
        value.grupo,
        value.categoria,
        nullable(value.nome_completo_razao_social),
        nullable(value.nome_fantasia),
        value.pessoa_tipo || null,
        nullable(value.documento),
        nullable(value.whatsapp),
        nullable(value.email)?.toLowerCase() || null,
        nullable(value.instagram),
        nullable(value.site),
        nullable(value.endereco),
        nullable(value.numero),
        nullable(value.complemento),
        nullable(value.bairro),
        nullable(value.cidade),
        nullable(value.uf)?.toUpperCase() || null,
        nullable(value.cep),
        codigo,
        value.desconto_percentual,
        value.comissao_percentual,
        value.dia_repasse,
        nullable(value.pix_tipo),
        nullable(value.pix_chave),
        nullable(value.pix_titular),
        nullable(value.pix_documento_titular),
        value.status,
        nullable(value.observacoes),
        nullable(value.nome_airbnb),
        value.quantidade_unidades ?? null,
        nullable(value.bairros_atendidos),
        nullable(value.empresa_gestora),
        ativo,
      ]
      const result = id
        ? await client.query<ParceiroRow>(
            `UPDATE parceiros SET
               nome=$1, tipo=$2, grupo=$3, categoria=$4, nome_completo_razao_social=$5,
               nome_fantasia=$6, pessoa_tipo=$7, documento=$8, whatsapp=$9, email=$10,
               instagram=$11, site=$12, endereco=$13, numero=$14, complemento=$15,
               bairro=$16, cidade=$17, uf=$18, cep=$19, codigo_indicacao=$20,
               desconto_percentual=$21, comissao_percentual=$22, dia_repasse=$23,
               pix_tipo=$24, pix_chave=$25, pix_titular=$26, pix_documento_titular=$27,
               status=$28, observacoes=$29, nome_airbnb=$30, quantidade_unidades=$31,
               bairros_atendidos=$32, empresa_gestora=$33, ativo=$34, updated_at=CURRENT_TIMESTAMP
             WHERE id=$35 RETURNING ${PARCEIRO_COLUMNS}`,
            [...params, id]
          )
        : await client.query<ParceiroRow>(
            `INSERT INTO parceiros (
               nome, tipo, grupo, categoria, nome_completo_razao_social, nome_fantasia,
               pessoa_tipo, documento, whatsapp, email, instagram, site, endereco, numero,
               complemento, bairro, cidade, uf, cep, codigo_indicacao, desconto_percentual,
               comissao_percentual, dia_repasse, pix_tipo, pix_chave, pix_titular,
               pix_documento_titular, status, observacoes, nome_airbnb, quantidade_unidades,
               bairros_atendidos, empresa_gestora, ativo
             ) VALUES (${params.map((_, index) => `$${index + 1}`).join(", ")})
             RETURNING ${PARCEIRO_COLUMNS}`,
            params
          )
      if (!result.rows[0]) throw new Error("PARCEIRO_NAO_ENCONTRADO")
      await client.query(
        `INSERT INTO parceiro_auditoria (parceiro_id, usuario_id, acao, alteracoes)
         VALUES ($1, $2, $3, $4::jsonb)`,
        [result.rows[0].id, user.id, id ? "atualizado" : "criado", JSON.stringify({ antes: before?.rows[0] ?? null, depois: result.rows[0] })]
      )
      return mapParceiro(result.rows[0])
    })
    revalidateParceiros()
    return { success: true, parceiro }
  } catch (error) {
    return mutationError(error, "Erro ao salvar parceiro")
  }
}

export interface RelatorioParceiro {
  id: string
  nome: string
  tipo: string
  grupo: GrupoParceiro
  categoria: string
  codigo_indicacao: string
  total_atendimentos: number
  total_malas: number
  valor_bruto: number
  desconto_total: number
  comissao_total: number
  valor_liquido_bagpoint: number
  valor_total: number
}

type RelatorioParceiroRow = Omit<RelatorioParceiro, "total_atendimentos" | "total_malas" | "valor_bruto" | "desconto_total" | "comissao_total" | "valor_liquido_bagpoint" | "valor_total"> & {
  total_atendimentos: string
  total_malas: string
  valor_bruto: string
  desconto_total: string
  comissao_total: string
  valor_liquido_bagpoint: string
  valor_total: string
}

export async function buscarRelatorioParceiros(dataInicio: string, dataFim: string): Promise<RelatorioParceiro[]> {
  if (!(await getCurrentUser())) return []
  try {
    const result = await query<RelatorioParceiroRow>(
      `SELECT p.id, p.nome, p.tipo, p.grupo, p.categoria, p.codigo_indicacao,
              count(DISTINCT a.id) AS total_atendimentos, count(m.id) AS total_malas,
              COALESCE(sum(a.valor_bruto) FILTER (WHERE m.rn = 1), 0) AS valor_bruto,
              COALESCE(sum(a.desconto_valor) FILTER (WHERE m.rn = 1), 0) AS desconto_total,
              COALESCE(sum(a.comissao_valor) FILTER (WHERE m.rn = 1), 0) AS comissao_total,
              COALESCE(sum(a.valor_liquido_bagpoint) FILTER (WHERE m.rn = 1), 0) AS valor_liquido_bagpoint,
              COALESCE(sum(a.valor_cobrado) FILTER (WHERE m.rn = 1), 0) AS valor_total
         FROM parceiros p
         JOIN atendimentos a ON a.parceiro_id = p.id
         LEFT JOIN LATERAL (
           SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn
             FROM malas WHERE atendimento_id = a.id
         ) m ON true
        WHERE a.data_checkin >= ($1::date::timestamp AT TIME ZONE 'America/Sao_Paulo')
          AND a.data_checkin < (($2::date + 1)::timestamp AT TIME ZONE 'America/Sao_Paulo')
        GROUP BY p.id
        ORDER BY comissao_total DESC, p.nome`,
      [dataInicio, dataFim]
    )
    return result.rows.map((row) => ({
      ...row,
      total_atendimentos: Number(row.total_atendimentos),
      total_malas: Number(row.total_malas),
      valor_bruto: Number(row.valor_bruto),
      desconto_total: Number(row.desconto_total),
      comissao_total: Number(row.comissao_total),
      valor_liquido_bagpoint: Number(row.valor_liquido_bagpoint),
      valor_total: Number(row.valor_total),
    }))
  } catch (error) {
    console.error("Erro ao buscar relatório de parceiros:", error)
    return []
  }
}

function mutationError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "code" in error && error.code === "23505") {
    return { success: false, error: "Documento ou código de indicação já cadastrado" }
  }
  const message = error instanceof Error && ["Não autenticado", "Sem permissão"].includes(error.message)
    ? error.message
    : error instanceof Error && error.message === "PARCEIRO_NAO_ENCONTRADO"
      ? "Parceiro não encontrado"
      : fallback
  if (message === fallback) console.error(`${fallback}:`, error)
  return { success: false, error: message }
}
