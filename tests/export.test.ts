import assert from "node:assert/strict"
import test from "node:test"

import { gerarCSV, gerarExcel } from "../lib/utils/export.ts"

const atendimento = {
  id: "00000000-0000-4000-8000-000000000001",
  protocolo: "20260825-0001",
  cliente_nome: "Cliente Teste",
  cliente_documento_tipo: "CPF" as const,
  cliente_documento: "123.456.789-00",
  cliente_telefone: "11999999999",
  valor_cobrado: 25,
  forma_pagamento: "pix" as const,
  status: "ativo",
  data_checkin: "2026-08-25T12:00:00.000Z",
  data_retirada: null,
  qtd_malas: 2,
}

test("gerarCSV preserva os dados principais", () => {
  const csv = gerarCSV([atendimento])
  assert.match(csv, /20260825-0001/)
  assert.match(csv, /Cliente Teste/)
  assert.match(csv, /123\.456\.789-00/)
  assert.match(csv, /Em Guarda/)
  assert.match(csv, /PIX/)
})

test("gerarExcel produz um arquivo XLSX válido", async () => {
  const excel = await gerarExcel([atendimento])
  assert.equal(excel[0], 0x50)
  assert.equal(excel[1], 0x4b)
  assert.ok(excel.byteLength > 1_000)
})
