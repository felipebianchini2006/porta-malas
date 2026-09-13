import assert from "node:assert/strict"
import test from "node:test"

import { gerarExcelRepasses } from "../lib/utils/partner-export.ts"

test("exportação mensal de repasses gera XLSX com dados financeiros", async () => {
  const excel = await gerarExcelRepasses([{
    id: "00000000-0000-4000-8000-000000000001",
    parceiro_id: "00000000-0000-4000-8000-000000000002",
    parceiro_nome: "Hotel Parceiro",
    codigo_indicacao: "HOS-HOTEL-PARCEIRO",
    grupo: "Hospedagem",
    categoria: "Hotel",
    pix_tipo: "CNPJ",
    pix_chave: "12.345.678/0001-00",
    pix_titular: "Hotel Parceiro Ltda",
    competencia: "2026-09-01",
    quantidade_atendimentos: 3,
    quantidade_malas: 5,
    valor_bruto: 100,
    desconto_total: 5,
    comissao_total: 5,
    valor_liquido_bagpoint: 90,
    vencimento: "2026-10-20",
    dias_restantes: 37,
    status: "em_aberto",
    data_pagamento: null,
    comprovante: null,
  }], "2026-09")

  assert.equal(excel[0], 0x50)
  assert.equal(excel[1], 0x4b)
  assert.ok(excel.byteLength > 1_000)
})
