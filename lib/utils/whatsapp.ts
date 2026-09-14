import { normalizarTelefone } from "./telefone.ts"

const ASSINATURA = "\n\n— *Bag Point* 🧳\nguarda-bagagens"
const LINK_AVALIACAO_GOOGLE = "https://g.page/r/CQ8rvyQC96ZlEBM/review"

const CONVITE_AVALIACAO = `Esperamos que tenha tido uma ótima experiência com a BagPoint!

Se puder dedicar 1 minutinho para avaliar nosso atendimento no Google, vai ajudar muito a gente e também outros viajantes a conhecerem nosso serviço.

⭐ Sua avaliação é muito importante para nós!
${LINK_AVALIACAO_GOOGLE}

Muito obrigado pela confiança e esperamos te receber novamente no Rio!`

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
  const msg = `Olá ${nome}! 🧳 Retirada confirmada.\n\nProtocolo: *${protocolo}*\nHorário de saída: ${horario}\n\n${CONVITE_AVALIACAO}${ASSINATURA}`
  return `https://wa.me/${normalizarTelefone(telefone).replace("+", "")}?text=${encodeURIComponent(msg)}`
}
