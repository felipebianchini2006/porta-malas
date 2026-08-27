import path from "node:path"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function confirmarProtocoloExato(protocolo: string, confirmacao: string): boolean {
  return confirmacao === protocolo
}

export function resolverDiretorioAtendimento(uploadRoot: string, atendimentoId: string): string {
  if (!UUID_PATTERN.test(atendimentoId)) {
    throw new Error("Atendimento inválido")
  }

  const root = path.resolve(uploadRoot)
  const directory = path.resolve(root, atendimentoId)
  if (path.dirname(directory) !== root) {
    throw new Error("Atendimento inválido")
  }

  return directory
}
