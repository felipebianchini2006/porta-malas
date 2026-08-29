import assert from "node:assert/strict"
import test from "node:test"

import {
  mensagemCompartilhamentoFotos,
  nomeArquivoFoto,
} from "../lib/utils/photo-share.ts"

test("nomeia cada arquivo compartilhado com o lacre da mala", () => {
  assert.equal(nomeArquivoFoto("A 9/90", 2), "bag-point-lacre-A-9-90-02.jpg")
})

test("mensagem lista protocolo e lacres sem repetir identificadores", () => {
  assert.equal(
    mensagemCompartilhamentoFotos("John", "20260829-0001", ["A1", "A1", "B2"]),
    "Olá John! Seguem as fotos das suas malas lacradas.\n\nProtocolo: 20260829-0001\nLacres: A1, B2\n\n— Bag Point 🧳"
  )
})
