import assert from "node:assert/strict"
import test from "node:test"

import {
  formatarTelefone,
  normalizarTelefone,
  telefoneValido,
} from "../lib/utils/telefone.ts"
import { linkCheckin } from "../lib/utils/whatsapp.ts"

test("mantém números internacionais sem adicionar o código do Brasil", () => {
  assert.equal(normalizarTelefone("+1 (202) 555-0123"), "+12025550123")
  assert.match(linkCheckin("+1 (202) 555-0123", "John", "ABC", "10:00"), /wa\.me\/12025550123/)
  assert.equal(formatarTelefone("+12025550123"), "+1 2025550123")
})

test("mantém compatibilidade com números brasileiros antigos", () => {
  assert.equal(normalizarTelefone("(11) 99999-9999"), "+5511999999999")
  assert.equal(normalizarTelefone("5511999999999"), "+5511999999999")
  assert.match(linkCheckin("11999999999", "Ana", "ABC", "10:00"), /wa\.me\/5511999999999/)
  assert.equal(formatarTelefone("11999999999"), "(11) 99999-9999")
})

test("rejeita telefone sem tamanho internacional válido", () => {
  assert.equal(telefoneValido("123"), false)
  assert.equal(telefoneValido("+12345678"), true)
  assert.equal(telefoneValido("+1234567890123456"), false)
})
