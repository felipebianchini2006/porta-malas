import assert from "node:assert/strict"
import test from "node:test"

import {
  formaPagamentoValida,
  labelFormaPagamento,
} from "../lib/utils/payment.ts"

test("aceita apenas as quatro formas de pagamento do contrato", () => {
  for (const value of ["credito", "debito", "pix", "dinheiro"]) {
    assert.equal(formaPagamentoValida(value), true)
  }
  assert.equal(formaPagamentoValida("boleto"), false)
})

test("registros antigos sem pagamento aparecem como não informado", () => {
  assert.equal(labelFormaPagamento(null), "Não informado")
  assert.equal(labelFormaPagamento("credito"), "Crédito")
})
