"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FiltroData } from "@/components/relatorio/filtro-data"
import { buscarRelatorioParceiros, type RelatorioParceiro } from "@/lib/actions/parceiros"
import { Download } from "lucide-react"

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0]
}

function getFirstDayOfMonthStr(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function exportCsv(dados: RelatorioParceiro[], dataInicio: string, dataFim: string) {
  const header = ["Parceiro", "Tipo", "Atendimentos", "Valor Total"]
  const rows = dados.map((d) => [
    d.nome,
    d.tipo,
    String(d.total_atendimentos),
    formatCurrency(d.valor_total),
  ])
  const csv = [header, ...rows].map((r) => r.join(";")).join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `parceiros_${dataInicio}_${dataFim}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function RelatorioParceirosPage() {
  const today = getTodayStr()
  const firstDay = getFirstDayOfMonthStr()
  const [dataInicio, setDataInicio] = useState(firstDay)
  const [dataFim, setDataFim] = useState(today)
  const [dados, setDados] = useState<RelatorioParceiro[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchDados(inicio: string, fim: string) {
    setLoading(true)
    try {
      const result = await buscarRelatorioParceiros(inicio, fim)
      setDados(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDados(dataInicio, dataFim)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFiltrar(inicio: string, fim: string) {
    setDataInicio(inicio)
    setDataFim(fim)
    fetchDados(inicio, fim)
  }

  const totalAtendimentos = dados.reduce((s, d) => s + d.total_atendimentos, 0)
  const totalValor = dados.reduce((s, d) => s + d.valor_total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatório de Parceiros</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comissione parceiros ao fim do mês
          </p>
        </div>
        {dados.length > 0 && (
          <button
            onClick={() => exportCsv(dados, dataInicio, dataFim)}
            className="flex items-center gap-2 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        )}
      </div>

      <FiltroData
        dataInicio={dataInicio}
        dataFim={dataFim}
        onFiltrar={handleFiltrar}
        loading={loading}
      />

      {loading && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Carregando...
        </div>
      )}

      {!loading && dados.length === 0 && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Nenhum atendimento com parceiro no período.
        </div>
      )}

      {!loading && dados.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">
              {dados.length} parceiro{dados.length !== 1 ? "s" : ""} · {totalAtendimentos} atendimento{totalAtendimentos !== 1 ? "s" : ""} · {formatCurrency(totalValor)} total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <th className="pb-3 pr-4">Parceiro</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4 text-right">Atendimentos</th>
                    <th className="pb-3 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dados.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-medium">{d.nome}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{d.tipo}</td>
                      <td className="py-3 pr-4 text-right">{d.total_atendimentos}</td>
                      <td className="py-3 text-right font-semibold text-slate-800">
                        {formatCurrency(d.valor_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
