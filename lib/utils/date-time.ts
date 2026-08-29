export const APP_TIME_ZONE = "America/Sao_Paulo"

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  }
}

export function formatarDataHora(value: string | Date | null): string {
  if (!value) return "-"
  const parts = dateParts(value instanceof Date ? value : new Date(value))
  return `${parts.day}/${parts.month}/${parts.year}, ${parts.hour}:${parts.minute}`
}

export function formatarData(value: string | Date | null): string {
  if (!value) return "-"
  const parts = dateParts(value instanceof Date ? value : new Date(value))
  return `${parts.day}/${parts.month}/${parts.year}`
}

export function dataLocalISO(date = new Date()): string {
  const parts = dateParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function inicioSemanaLocalISO(date = new Date()): string {
  const current = dataLocalISO(date)
  const [year, month, day] = current.split("-").map(Number)
  const calendarDate = new Date(Date.UTC(year, month - 1, day, 12))
  const weekDay = calendarDate.getUTCDay()
  const daysSinceMonday = weekDay === 0 ? 6 : weekDay - 1
  calendarDate.setUTCDate(calendarDate.getUTCDate() - daysSinceMonday)
  return calendarDate.toISOString().slice(0, 10)
}
