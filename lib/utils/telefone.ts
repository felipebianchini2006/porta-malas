const E164_MIN_DIGITS = 8
const E164_MAX_DIGITS = 15

function somenteDigitos(value: string): string {
  return value.replace(/\D/g, "")
}

export function normalizarTelefone(telefone: string): string {
  const value = telefone.trim()
  let digits = somenteDigitos(value)

  if (value.startsWith("00")) digits = digits.slice(2)

  const isInternational = value.startsWith("+") || value.startsWith("00")
  if (!isInternational) {
    if (digits.length === 10 || digits.length === 11) digits = `55${digits}`
    else if (!(digits.startsWith("55") && (digits.length === 12 || digits.length === 13))) {
      throw new Error("Informe o código do país com +")
    }
  }

  if (digits.length < E164_MIN_DIGITS || digits.length > E164_MAX_DIGITS) {
    throw new Error("Telefone internacional inválido")
  }

  return `+${digits}`
}

export function telefoneValido(telefone: string): boolean {
  try {
    normalizarTelefone(telefone)
    return true
  } catch {
    return false
  }
}

export function formatarTelefone(telefone: string): string {
  const rawDigits = somenteDigitos(telefone)
  const localDigits = rawDigits.startsWith("55") && (rawDigits.length === 12 || rawDigits.length === 13)
    ? rawDigits.slice(2)
    : rawDigits

  if (localDigits.length === 11 && (!telefone.trim().startsWith("+") || rawDigits.startsWith("55"))) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`
  }
  if (localDigits.length === 10 && (!telefone.trim().startsWith("+") || rawDigits.startsWith("55"))) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`
  }

  try {
    const normalized = normalizarTelefone(telefone)
    const digits = somenteDigitos(normalized)
    return `+${digits.slice(0, 1)} ${digits.slice(1)}`
  } catch {
    return telefone
  }
}
