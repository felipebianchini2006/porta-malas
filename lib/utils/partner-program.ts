export type GrupoParceiro = "Hospedagem" | "Indicação Local"
export type StatusRepasse = "em_aberto" | "programado" | "pago" | "vencido" | "bloqueado"
export type AlertaRepasse = "cinco_dias" | "amanha" | "hoje" | "vencido"

interface CalculoProgramaParceiroInput {
  valorBase: number
  descontoPercentual: number
  comissaoPercentual: number
}

export interface CalculoProgramaParceiro {
  valorBruto: number
  descontoValor: number
  valorCobrado: number
  comissaoValor: number
  valorLiquidoBagpoint: number
}

function centavos(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calcularProgramaParceiro({
  valorBase,
  descontoPercentual,
  comissaoPercentual,
}: CalculoProgramaParceiroInput): CalculoProgramaParceiro {
  const valorBruto = centavos(Math.max(0, valorBase))
  const descontoValor = centavos(valorBruto * Math.max(0, descontoPercentual) / 100)
  const comissaoValor = centavos(valorBruto * Math.max(0, comissaoPercentual) / 100)
  const valorCobrado = centavos(valorBruto - descontoValor)

  return {
    valorBruto,
    descontoValor,
    valorCobrado,
    comissaoValor,
    valorLiquidoBagpoint: centavos(valorCobrado - comissaoValor),
  }
}

export function gerarCodigoIndicacao(grupo: GrupoParceiro, nome: string): string {
  const prefixo = grupo === "Hospedagem" ? "HOS" : "IND"
  const slug = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32)
  return `${prefixo}-${slug || "PARCEIRO"}`
}

export function categoriaPodeReceberDescontoParceiro(categoria: {
  nome: string
  descricao?: string | null
  exemplos?: string | null
}): boolean {
  const texto = [categoria.nome, categoria.descricao, categoria.exemplos]
    .filter(Boolean)
    .join(" ")
  return !/\bPARCEIRO\b/i.test(texto)
}

export function statusAlertaRepasse(
  diasRestantes: number,
  status: StatusRepasse
): AlertaRepasse | null {
  if (status === "pago" || status === "bloqueado") return null
  if (diasRestantes < 0) return "vencido"
  if (diasRestantes === 0) return "hoje"
  if (diasRestantes === 1) return "amanha"
  if (diasRestantes === 5) return "cinco_dias"
  return null
}
