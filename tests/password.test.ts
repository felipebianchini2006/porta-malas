import assert from "node:assert/strict"
import test from "node:test"

import { hashPassword, verifyPassword } from "../lib/auth/password.ts"

test("hashPassword cria hash scrypt verificável sem armazenar a senha", async () => {
  const password = "Senha-forte-123"
  const hash = await hashPassword(password)

  assert.match(hash, /^scrypt\$[^$]+\$[^$]+$/)
  assert.equal(hash.includes(password), false)
  assert.equal(await verifyPassword(password, hash), true)
})

test("verifyPassword rejeita senha errada e formato inválido", async () => {
  const hash = await hashPassword("Senha-forte-123")

  assert.equal(await verifyPassword("senha-errada", hash), false)
  assert.equal(await verifyPassword("Senha-forte-123", "hash-invalido"), false)
})

test("hashPassword rejeita senha curta", async () => {
  await assert.rejects(() => hashPassword("curta"), /pelo menos 8 caracteres/)
})
