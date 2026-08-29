function slugLacre(lacre: string): string {
  return lacre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "sem-id"
}

export function nomeArquivoFoto(lacre: string, index: number): string {
  return `bag-point-lacre-${slugLacre(lacre)}-${String(index).padStart(2, "0")}.jpg`
}

export function mensagemCompartilhamentoFotos(
  nome: string,
  protocolo: string,
  lacres: string[]
): string {
  const uniqueLacres = [...new Set(lacres)]
  return `Olá ${nome}! Seguem as fotos das suas malas lacradas.\n\nProtocolo: ${protocolo}\nLacres: ${uniqueLacres.join(", ")}\n\n— Bag Point 🧳`
}
