import assert from "node:assert/strict"
import test from "node:test"

import {
  dataLocalISO,
  formatarDataHora,
  inicioSemanaLocalISO,
} from "../lib/utils/date-time.ts"

test("exibe timestamps no horário de São Paulo", () => {
  assert.equal(formatarDataHora("2026-08-28T18:39:23.000Z"), "28/08/2026, 15:39")
})

test("gera a data e a segunda-feira conforme São Paulo, não conforme UTC", () => {
  const domingoNoiteEmSaoPaulo = new Date("2026-08-31T01:30:00.000Z")
  assert.equal(dataLocalISO(domingoNoiteEmSaoPaulo), "2026-08-30")
  assert.equal(inicioSemanaLocalISO(domingoNoiteEmSaoPaulo), "2026-08-24")
})
