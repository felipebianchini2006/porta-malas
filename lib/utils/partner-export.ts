import ExcelJS from "exceljs"

import type { Repasse } from "../actions/repasses.ts"

export async function gerarExcelRepasses(repasses: Repasse[], competencia: string): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "BagPoint"
  const worksheet = workbook.addWorksheet("Repasses")

  worksheet.columns = [
    { header: "Competência", key: "competencia", width: 14 },
    { header: "Parceiro", key: "parceiro", width: 30 },
    { header: "Código", key: "codigo", width: 18 },
    { header: "Grupo", key: "grupo", width: 20 },
    { header: "Categoria", key: "categoria", width: 22 },
    { header: "Atendimentos", key: "atendimentos", width: 14 },
    { header: "Malas", key: "malas", width: 10 },
    { header: "Valor bruto", key: "bruto", width: 16 },
    { header: "Descontos", key: "desconto", width: 16 },
    { header: "Comissão", key: "comissao", width: 16 },
    { header: "Líquido BagPoint", key: "liquido", width: 18 },
    { header: "Vencimento", key: "vencimento", width: 14 },
    { header: "Status", key: "status", width: 14 },
    { header: "PIX", key: "pix", width: 32 },
    { header: "Titular PIX", key: "titular", width: 28 },
    { header: "Pagamento", key: "pagamento", width: 22 },
    { header: "Comprovante", key: "comprovante", width: 28 },
  ]

  for (const repasse of repasses) {
    worksheet.addRow({
      competencia,
      parceiro: repasse.parceiro_nome,
      codigo: repasse.codigo_indicacao,
      grupo: repasse.grupo,
      categoria: repasse.categoria,
      atendimentos: repasse.quantidade_atendimentos,
      malas: repasse.quantidade_malas,
      bruto: repasse.valor_bruto,
      desconto: repasse.desconto_total,
      comissao: repasse.comissao_total,
      liquido: repasse.valor_liquido_bagpoint,
      vencimento: repasse.vencimento,
      status: repasse.status.replaceAll("_", " "),
      pix: [repasse.pix_tipo, repasse.pix_chave].filter(Boolean).join(": "),
      titular: repasse.pix_titular ?? "",
      pagamento: repasse.data_pagamento ?? "",
      comprovante: repasse.comprovante ?? "",
    })
  }

  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7C3AED" } }
  for (const key of ["bruto", "desconto", "comissao", "liquido"]) {
    worksheet.getColumn(key).numFmt = 'R$ #,##0.00'
  }
  worksheet.autoFilter = { from: "A1", to: "Q1" }
  worksheet.views = [{ state: "frozen", ySplit: 1 }]
  return new Uint8Array(await workbook.xlsx.writeBuffer())
}
