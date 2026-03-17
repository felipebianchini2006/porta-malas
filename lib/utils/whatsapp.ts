export function linkCheckin(telefone: string, nome: string, protocolo: string, horario: string): string {
  const msg = `Olá ${nome}! ✅ Check-in realizado com sucesso.\n\nProtocolo: *${protocolo}*\nHorário: ${horario}\n\nGuarde este número para retirar suas bagagens.`
  return `https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`
}

export function linkRetirada(telefone: string, nome: string, protocolo: string, horario: string): string {
  const msg = `Olá ${nome}! 🧳 Retirada confirmada.\n\nProtocolo: *${protocolo}*\nHorário de saída: ${horario}\n\nObrigado pela preferência!`
  return `https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`
}
