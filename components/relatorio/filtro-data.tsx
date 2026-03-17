"use client"

interface FiltroDatProps {
  dataInicio: string // YYYY-MM-DD
  dataFim: string // YYYY-MM-DD
  onFiltrar: (inicio: string, fim: string) => void
  loading?: boolean
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0]
}

function getMondayStr(): string {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split("T")[0]
}

export function FiltroData({ dataInicio, dataFim, onFiltrar, loading }: FiltroDatProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="data-inicio" className="text-xs font-medium text-slate-600">
            De:
          </label>
          <input
            id="data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => onFiltrar(e.target.value, dataFim)}
            className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="data-fim" className="text-xs font-medium text-slate-600">
            Até:
          </label>
          <input
            id="data-fim"
            type="date"
            value={dataFim}
            onChange={(e) => onFiltrar(dataInicio, e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          onClick={() => onFiltrar(dataInicio, dataFim)}
          disabled={loading}
          className="h-9 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Filtrar"}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            const today = getTodayStr()
            onFiltrar(today, today)
          }}
          disabled={loading}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Hoje
        </button>

        <button
          onClick={() => {
            const monday = getMondayStr()
            const today = getTodayStr()
            onFiltrar(monday, today)
          }}
          disabled={loading}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Esta semana
        </button>
      </div>
    </div>
  )
}
