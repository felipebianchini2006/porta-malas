import { normalizarTelefone } from "./telefone.ts"

const ASSINATURA = "\n\n— *Bag Point* 🧳\nguarda-bagagens"

export function linkCheckin(telefone: string, nome: string, protocolo: string, horario: string): string {
  const msg = `Olá ${nome}! ✅ Check-in realizado com sucesso.\n\nProtocolo: *${protocolo}*\nHorário: ${horario}\n\nGuarde este número para retirar suas bagagens.${ASSINATURA}`
  return `https://wa.me/${normalizarTelefone(telefone).replace("+", "")}?text=${encodeURIComponent(msg)}`
}

export function linkRetirada(telefone: string, nome: string, protocolo: string, horario: string): string {
  const msg = `Olá ${nome}! 🧳 Retirada confirmada.\n\nProtocolo: *${protocolo}*\nHorário de saída: ${horario}\n\nObrigado pela preferência!${ASSINATURA}`
  return `https://wa.me/${normalizarTelefone(telefone).replace("+", "")}?text=${encodeURIComponent(msg)}`
}
