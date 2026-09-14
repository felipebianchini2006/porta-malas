import assert from "node:assert/strict"
import test from "node:test"

import { linkRetirada } from "../lib/utils/whatsapp.ts"

test("comprovante de retirada convida o cliente para avaliar a BagPoint no Google", () => {
  const link = linkRetirada(
    "+55 21 99999-9999",
    "Ana",
    "20260914-0001",
    "14/09/2026, 17:30"
  )

  assert.match(link, /^https:\/\/wa\.me\/5521999999999\?text=/)

  const mensagem = decodeURIComponent(link.split("?text=")[1] ?? "")
  assert.match(mensagem, /Retirada confirmada/)
  assert.match(mensagem, /Protocolo: \*20260914-0001\*/)
  assert.match(mensagem, /avaliar nosso atendimento no Google/)
  assert.match(mensagem, /https:\/\/g\.page\/r\/CQ8rvyQC96ZlEBM\/review/)
  assert.match(mensagem, /esperamos te receber novamente no Rio/i)
})
