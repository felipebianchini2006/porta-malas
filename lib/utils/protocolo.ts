export function formatarProtocolo(protocolo: string): string {
  return protocolo // already formatted as GM-XXXX
}

export function formatarTelefone(telefone: string): string {
  const nums = telefone.replace(/\D/g, "")
  if (nums.length === 11) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
  }
  if (nums.length === 10) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`
  }
  return telefone
}
