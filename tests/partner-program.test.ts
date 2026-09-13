import assert from "node:assert/strict"
import test from "node:test"

import {
  calcularProgramaParceiro,
  gerarCodigoIndicacao,
  statusAlertaRepasse,
} from "../lib/utils/partner-program.ts"

test("calcula desconto e comissão sobre o valor-base com arredondamento monetário", () => {
  assert.deepEqual(
    calcularProgramaParceiro({
      valorBase: 105,
      descontoPercentual: 5,
      comissaoPercentual: 5,
    }),
    {
      valorBruto: 105,
      descontoValor: 5.25,
      valorCobrado: 99.75,
      comissaoValor: 5.25,
      valorLiquidoBagpoint: 94.5,
    }
  )
})

test("arredonda cada efeito financeiro em centavos", () => {
  assert.deepEqual(
    calcularProgramaParceiro({
      valorBase: 33.25,
      descontoPercentual: 5,
      comissaoPercentual: 5,
    }),
    {
      valorBruto: 33.25,
      descontoValor: 1.66,
      valorCobrado: 31.59,
      comissaoValor: 1.66,
      valorLiquidoBagpoint: 29.93,
    }
  )
})

test("gera código estável e legível conforme o grupo", () => {
  assert.equal(gerarCodigoIndicacao("Hospedagem", "Pousada São João"), "HOS-POUSADA-SAO-JOAO")
  assert.equal(gerarCodigoIndicacao("Indicação Local", "Café da Praça"), "IND-CAFE-DA-PRACA")
})

test("classifica alertas de repasse pelos dias restantes", () => {
  assert.equal(statusAlertaRepasse(-1, "em_aberto"), "vencido")
  assert.equal(statusAlertaRepasse(0, "em_aberto"), "hoje")
  assert.equal(statusAlertaRepasse(1, "em_aberto"), "amanha")
  assert.equal(statusAlertaRepasse(5, "em_aberto"), "cinco_dias")
  assert.equal(statusAlertaRepasse(8, "em_aberto"), null)
  assert.equal(statusAlertaRepasse(-2, "pago"), null)
})
