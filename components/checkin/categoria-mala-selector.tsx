"use client"

import { cn } from "@/lib/utils"
import type { CategoriaMala } from "@/lib/actions/categorias-mala"

interface CategoriaMalaSelectorProps {
  categorias: CategoriaMala[]
  value: string | null
  onSelect: (categoria: CategoriaMala) => void
}

export function CategoriaMalaSelector({ categorias, value, onSelect }: CategoriaMalaSelectorProps) {
  if (categorias.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-muted-foreground">
        Nenhuma categoria ativa. A mala ainda pode ser registrada sem categoria.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {categorias.map((cat) => {
        const isSelected = value === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-md border p-3 text-left text-sm transition-colors",
              isSelected
                ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50"
            )}
          >
            <span className="font-medium">
              {cat.emoji} {cat.nome}
            </span>
            <span className="text-xs text-muted-foreground">{cat.exemplos}</span>
            <span className="mt-1 text-xs font-semibold text-slate-700">
              R$ {Number(cat.preco_diaria).toFixed(2).replace(".", ",")}/dia
              {Number(cat.preco_meio_periodo) > 0 && ` · R$ ${Number(cat.preco_meio_periodo).toFixed(2).replace(".", ",")}/½`}
            </span>
          </button>
        )
      })}
    </div>
  )
}
