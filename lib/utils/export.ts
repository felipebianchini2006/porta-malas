import ExcelJS from "exceljs"
import type { RelatorioAtendimento } from "../actions/relatorio.ts"
import { formatarDataHora } from "./date-time.ts"
import { labelFormaPagamento } from "./payment.ts"

function formatCurrency(value: number | null): string {
  if (!value) return "-"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatStatus(status: string): string {
  return status === "ativo" ? "Em Guarda" : "Retirado"
}

export function gerarCSV(atendimentos: RelatorioAtendimento[]): string {
  const headers = ["Protocolo", "Cliente", "Documento", "Telefone", "Qtd. Malas", "Valor", "Pagamento", "Status", "Check-in", "Retirada"]

  const rows = atendimentos.map((a) => [
    a.protocolo,
    a.cliente_nome,
    [a.cliente_documento_tipo, a.cliente_documento].filter(Boolean).join(": "),
    a.cliente_telefone,
    a.qtd_malas.toString(),
    formatCurrency(a.valor_cobrado),
    labelFormaPagamento(a.forma_pagamento),
    formatStatus(a.status),
    formatarDataHora(a.data_checkin),
    formatarDataHora(a.data_retirada),
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n")

  return "\uFEFF" + csvContent // BOM for UTF-8 Excel compatibility
}

export async function gerarExcel(atendimentos: RelatorioAtendimento[]): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Relatório")
  worksheet.columns = [
    { header: "Protocolo", key: "protocolo", width: 12 },
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "Documento", key: "documento", width: 22 },
    { header: "Telefone", key: "telefone", width: 15 },
    { header: "Qtd. Malas", key: "quantidade", width: 10 },
    { header: "Valor (R$)", key: "valor", width: 12 },
    { header: "Pagamento", key: "pagamento", width: 18 },
    { header: "Status", key: "status", width: 12 },
    { header: "Check-in", key: "checkin", width: 20 },
    { header: "Retirada", key: "retirada", width: 20 },
  ]

  for (const atendimento of atendimentos) {
    worksheet.addRow({
      protocolo: atendimento.protocolo,
      cliente: atendimento.cliente_nome,
      documento: [atendimento.cliente_documento_tipo, atendimento.cliente_documento].filter(Boolean).join(": "),
      telefone: atendimento.cliente_telefone,
      quantidade: atendimento.qtd_malas,
      valor: atendimento.valor_cobrado || 0,
      pagamento: labelFormaPagamento(atendimento.forma_pagamento),
      status: formatStatus(atendimento.status),
      checkin: formatarDataHora(atendimento.data_checkin),
      retirada: formatarDataHora(atendimento.data_retirada),
    })
  }

  worksheet.getRow(1).font = { bold: true }
  worksheet.getColumn("valor").numFmt = 'R$ #,##0.00'
  return new Uint8Array(await workbook.xlsx.writeBuffer())
}
