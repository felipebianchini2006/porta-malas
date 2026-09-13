import { normalizarTelefone } from "./telefone.ts"

const ASSINATURA = "\n\n— *Bag Point* 🧳\nguarda-bagagens"

export function linkCheckin(telefone: string, nome: string, protocolo: string, horario: string): string {
  const msg = `Olá ${nome}! ✅ Check-in realizado com sucesso.\n\nProtocolo: *${protocolo}*\nHorário: ${horario}\n\nGuarde este número para retirar suas bagagens.${ASSINATURA}`
  return `https://wa.me/${normalizarTelefone(telefone).replace("+", "")}?text=${encodeURIComponent(msg)}`
}

interface LinkCheckinComAceiteInput {
  telefone: string
  nome: string
  protocolo: string
  horario: string
  aceiteUrl: string
}

export function linkCheckinComAceite({
  telefone,
  nome,
  protocolo,
  horario,
  aceiteUrl,
}: LinkCheckinComAceiteInput): string {
  const msg = `Olá ${nome}! ✅ Check-in realizado com sucesso.\n\nProtocolo: *${protocolo}*\nHorário: ${horario}\n\nPara concluir, faça o aceite das regras da Bag Point neste link:\n${aceiteUrl}\n\nGuarde o protocolo para retirar suas bagagens.${ASSINATURA}`
  return `https://wa.me/${normalizarTelefone(telefone).replace("+", "")}?text=${encodeURIComponent(msg)}`
}

export function linkRetirada(telefone: string, nome: string, protocolo: string, horario: string): string {
  const msg = `Olá ${nome}! 🧳 Retirada confirmada.\n\nProtocolo: *${protocolo}*\nHorário de saída: ${horario}\n\nObrigado pela preferência!${ASSINATURA}`
  return `https://wa.me/${normalizarTelefone(telefone).replace("+", "")}?text=${encodeURIComponent(msg)}`
}
