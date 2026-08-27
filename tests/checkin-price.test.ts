import assert from "node:assert/strict"
import test from "node:test"

import { calcularTotalMalas } from "../lib/utils/checkin-price.ts"

const categorias = [
  { id: "qualquer-mala", preco_diaria: 35 },
  { id: "especial", preco_diaria: "70.50" },
]

test("soma automaticamente o preço de cada mala selecionada", () => {
  assert.equal(
    calcularTotalMalas(
      [
        { categoria_id: "qualquer-mala" },
        { categoria_id: "qualquer-mala" },
        { categoria_id: "especial" },
      ],
      categorias
    ),
    140.5
  )
})

test("ignora malas sem categoria ou com categoria inexistente", () => {
  assert.equal(
    calcularTotalMalas(
      [{ categoria_id: null }, { categoria_id: "inexistente" }, { categoria_id: "qualquer-mala" }],
      categorias
    ),
    35
  )
})
