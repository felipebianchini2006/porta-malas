import type { Parceiro } from "@/lib/types"

export const PARAMETRO_INDICACAO = "parceiro"

export function normalizarCodigoIndicacao(value: string | null | undefined): string | null {
  const codigo = value?.trim()
  if (!codigo || codigo.length > 48 || /[\u0000-\u001f\u007f]/.test(codigo)) return null
  return codigo.toUpperCase()
}

export function criarLinkIndicacao(origin: string, codigo: string): string {
  const url = new URL("/checkin", origin)
  url.searchParams.set(PARAMETRO_INDICACAO, normalizarCodigoIndicacao(codigo) ?? codigo.trim())
  return url.toString()
}

export function extrairCodigoIndicacao(payload: string): string | null {
  const conteudo = payload.trim()
  if (!conteudo) return null

  try {
    const url = new URL(conteudo)
    const codigo = url.searchParams.get(PARAMETRO_INDICACAO)
    if (codigo) return normalizarCodigoIndicacao(codigo)
  } catch {
    // O QR também pode conter somente o código, sem URL.
  }

  const protocolo = conteudo.match(/^bagpoint:parceiro:(.+)$/i)
  return normalizarCodigoIndicacao(protocolo?.[1] ?? conteudo)
}

export function encontrarParceiroAtivoPorCodigo<T extends Pick<Parceiro, "codigo_indicacao" | "status" | "ativo">>(
  parceiros: T[],
  payload: string | null | undefined
): T | null {
  const codigo = payload ? extrairCodigoIndicacao(payload) : null
  if (!codigo) return null

  return parceiros.find((parceiro) =>
    parceiro.ativo
    && parceiro.status === "ativo"
    && normalizarCodigoIndicacao(parceiro.codigo_indicacao) === codigo
  ) ?? null
}
