import ExcelJS from "exceljs"
import type { RelatorioAtendimento } from "../actions/relatorio.ts"

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

function formatCurrency(value: number | null): string {
  if (!value) return "-"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatStatus(status: string): string {
  return status === "ativo" ? "Em Guarda" : "Retirado"
}

export function gerarCSV(atendimentos: RelatorioAtendimento[]): string {
  const headers = ["Protocolo", "Cliente", "Telefone", "Qtd. Malas", "Valor", "Status", "Check-in", "Retirada"]

  const rows = atendimentos.map((a) => [
    a.protocolo,
    a.cliente_nome,
    a.cliente_telefone,
    a.qtd_malas.toString(),
    formatCurrency(a.valor_cobrado),
    formatStatus(a.status),
    formatDate(a.data_checkin),
    formatDate(a.data_retirada),
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
    { header: "Telefone", key: "telefone", width: 15 },
    { header: "Qtd. Malas", key: "quantidade", width: 10 },
    { header: "Valor (R$)", key: "valor", width: 12 },
    { header: "Status", key: "status", width: 12 },
    { header: "Check-in", key: "checkin", width: 20 },
    { header: "Retirada", key: "retirada", width: 20 },
  ]

  for (const atendimento of atendimentos) {
    worksheet.addRow({
      protocolo: atendimento.protocolo,
      cliente: atendimento.cliente_nome,
      telefone: atendimento.cliente_telefone,
      quantidade: atendimento.qtd_malas,
      valor: atendimento.valor_cobrado || 0,
      status: formatStatus(atendimento.status),
      checkin: atendimento.data_checkin ? new Date(atendimento.data_checkin) : "",
      retirada: atendimento.data_retirada ? new Date(atendimento.data_retirada) : "",
    })
  }

  worksheet.getRow(1).font = { bold: true }
  worksheet.getColumn("valor").numFmt = 'R$ #,##0.00'
  worksheet.getColumn("checkin").numFmt = "dd/mm/yyyy hh:mm"
  worksheet.getColumn("retirada").numFmt = "dd/mm/yyyy hh:mm"

  return new Uint8Array(await workbook.xlsx.writeBuffer())
}
