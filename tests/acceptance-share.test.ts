import assert from "node:assert/strict"
import test from "node:test"

import { linkCheckinComAceite } from "../lib/utils/whatsapp.ts"

test("mensagem de check-in inclui link de aceite das regras", () => {
  const link = linkCheckinComAceite({
    telefone: "+55 11 99999-9999",
    nome: "Ana",
    protocolo: "20260913-0001",
    horario: "13/09/2026, 15:00",
    aceiteUrl: "https://bagpoint.example/aceite/token-seguro",
  })

  assert.match(link, /^https:\/\/wa\.me\/5511999999999\?text=/)
  const mensagem = decodeURIComponent(link.split("?text=")[1] ?? "")
  assert.match(mensagem, /aceite das regras/i)
  assert.match(mensagem, /https:\/\/bagpoint\.example\/aceite\/token-seguro/)
})
