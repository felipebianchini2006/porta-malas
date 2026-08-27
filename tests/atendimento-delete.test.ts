import assert from "node:assert/strict"
import path from "node:path"
import test from "node:test"

import {
  confirmarProtocoloExato,
  resolverDiretorioAtendimento,
} from "../lib/utils/atendimento-delete.ts"

const ATENDIMENTO_ID = "59b3c4dc-f283-4489-95b1-bfb2af9cb193"

test("resolverDiretorioAtendimento limita a limpeza ao diretório UUID do atendimento", () => {
  const uploadRoot = path.resolve("/tmp/porta-malas-uploads")

  assert.equal(
    resolverDiretorioAtendimento(uploadRoot, ATENDIMENTO_ID),
    path.join(uploadRoot, ATENDIMENTO_ID)
  )
  assert.throws(
    () => resolverDiretorioAtendimento(uploadRoot, "../outro-diretorio"),
    /Atendimento inválido/
  )
})

test("confirmação exige o protocolo completo e exato", () => {
  assert.equal(confirmarProtocoloExato("20260827-0001", "20260827-0001"), true)
  assert.equal(confirmarProtocoloExato("20260827-0001", "20260827"), false)
  assert.equal(confirmarProtocoloExato("20260827-0001", " 20260827-0001 "), false)
})
