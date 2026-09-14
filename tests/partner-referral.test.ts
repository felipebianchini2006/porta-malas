import assert from "node:assert/strict"
import test from "node:test"

import {
  criarLinkIndicacao,
  encontrarParceiroAtivoPorCodigo,
  extrairCodigoIndicacao,
} from "../lib/utils/partner-referral.ts"

const parceiroAtivo = {
  codigo_indicacao: "HOS-POUSADA-SOL",
  status: "ativo" as const,
  ativo: true,
}

test("gera link de indicação sem expor dados financeiros ou identificador interno", () => {
  const link = criarLinkIndicacao("https://bagpoint.example", parceiroAtivo.codigo_indicacao)

  assert.equal(link, "https://bagpoint.example/checkin?parceiro=HOS-POUSADA-SOL")
  assert.equal(link.includes("comissao"), false)
  assert.equal(link.includes("desconto"), false)
})

test("extrai o código de URL, protocolo BagPoint ou conteúdo puro", () => {
  assert.equal(extrairCodigoIndicacao("https://bagpoint.example/checkin?parceiro=hos-pousada-sol"), "HOS-POUSADA-SOL")
  assert.equal(extrairCodigoIndicacao("bagpoint:parceiro:HOS-POUSADA-SOL"), "HOS-POUSADA-SOL")
  assert.equal(extrairCodigoIndicacao(" hos-pousada-sol "), "HOS-POUSADA-SOL")
  assert.equal(extrairCodigoIndicacao(""), null)
})

test("seleciona somente parceiro ativo com código correspondente", () => {
  const inativo = { ...parceiroAtivo, status: "inativo" as const, ativo: false }

  assert.equal(encontrarParceiroAtivoPorCodigo([parceiroAtivo], "HOS-POUSADA-SOL"), parceiroAtivo)
  assert.equal(encontrarParceiroAtivoPorCodigo([inativo], "HOS-POUSADA-SOL"), null)
  assert.equal(encontrarParceiroAtivoPorCodigo([parceiroAtivo], "CODIGO-INEXISTENTE"), null)
})
