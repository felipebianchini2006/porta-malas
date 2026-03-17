import * as XLSX from "xlsx"
import { type RelatorioAtendimento } from "@/lib/actions/relatorio"

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

export function gerarExcel(atendimentos: RelatorioAtendimento[], periodo: string): Uint8Array {
  const wsData = [
    ["Protocolo", "Cliente", "Telefone", "Qtd. Malas", "Valor (R$)", "Status", "Check-in", "Retirada"],
    ...atendimentos.map((a) => [
      a.protocolo,
      a.cliente_nome,
      a.cliente_telefone,
      a.qtd_malas,
      a.valor_cobrado || 0,
      formatStatus(a.status),
      a.data_checkin ? new Date(a.data_checkin) : "",
      a.data_retirada ? new Date(a.data_retirada) : "",
    ]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws["!cols"] = [
    { wch: 12 }, // Protocolo
    { wch: 30 }, // Cliente
    { wch: 15 }, // Telefone
    { wch: 10 }, // Qtd
    { wch: 12 }, // Valor
    { wch: 12 }, // Status
    { wch: 20 }, // Check-in
    { wch: 20 }, // Retirada
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Relatório")

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Uint8Array
}
