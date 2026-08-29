"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FiltroData } from "@/components/relatorio/filtro-data"
import { TabelaRelatorio } from "@/components/relatorio/tabela-relatorio"
import { buscarRelatorio, type RelatorioData } from "@/lib/actions/relatorio"
import { dataLocalISO } from "@/lib/utils/date-time"
import { labelFormaPagamento } from "@/lib/utils/payment"

function getTodayStr(): string {
  return dataLocalISO()
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

interface StatCardProps {
  label: string
  value: string | number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function RelatorioPage() {
  const today = getTodayStr()
  const [dataInicio, setDataInicio] = useState(today)
  const [dataFim, setDataFim] = useState(today)
  const [dados, setDados] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchRelatorio(inicio: string, fim: string) {
    setLoading(true)
    try {
      const result = await buscarRelatorio(inicio, fim)
      setDados(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelatorio(dataInicio, dataFim)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFiltrar(inicio: string, fim: string) {
    setDataInicio(inicio)
    setDataFim(fim)
    fetchRelatorio(inicio, fim)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatório</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visualize e exporte relatórios de atendimentos</p>
        </div>
      </div>

      <FiltroData
        dataInicio={dataInicio}
        dataFim={dataFim}
        onFiltrar={handleFiltrar}
        loading={loading}
      />

      {dados && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard label="Total" value={dados.stats.total} />
            <StatCard label="Entradas" value={dados.stats.entradas} />
            <StatCard label="Retiradas" value={dados.stats.retiradas} />
            <StatCard label="Em Guarda" value={dados.stats.em_guarda} />
            <StatCard label="Valor Total" value={formatCurrency(dados.stats.valor_total)} />
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Recebimentos por forma de pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {dados.pagamentos.map((pagamento) => (
                  <div
                    key={pagamento.forma_pagamento ?? "nao-informado"}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-xs font-medium text-slate-600">
                      {labelFormaPagamento(pagamento.forma_pagamento)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {formatCurrency(pagamento.valor_total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pagamento.quantidade} atendimento{pagamento.quantidade === 1 ? "" : "s"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Atendimentos do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <TabelaRelatorio
                atendimentos={dados.atendimentos}
                dataInicio={dataInicio}
                dataFim={dataFim}
                canDelete={dados.can_delete}
                onAtendimentoExcluido={() => fetchRelatorio(dataInicio, dataFim)}
              />
            </CardContent>
          </Card>
        </>
      )}

      {loading && !dados && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Carregando...
        </div>
      )}
    </div>
  )
}
