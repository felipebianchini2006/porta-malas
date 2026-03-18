"use client"

import { cn } from "@/lib/utils"

export interface CategoriaMala {
  id: string
  emoji: string
  nome: string
  exemplos: string
  preco_diaria: number
  preco_meio_periodo: number
  descricao: string
}

export const CATEGORIAS_MALA: CategoriaMala[] = [
  {
    id: "small",
    emoji: "🟢",
    nome: "Small Bag",
    exemplos: "bolsa, mochila pequena",
    preco_diaria: 20,
    preco_meio_periodo: 15,
    descricao: "Small Bag",
  },
  {
    id: "cabin",
    emoji: "🔵",
    nome: "Cabin Size",
    exemplos: "mala de mão",
    preco_diaria: 30,
    preco_meio_periodo: 20,
    descricao: "Cabin Size",
  },
  {
    id: "large",
    emoji: "🟠",
    nome: "Large Luggage",
    exemplos: "mala grande",
    preco_diaria: 45,
    preco_meio_periodo: 30,
    descricao: "Large Luggage",
  },
  {
    id: "special",
    emoji: "⚫",
    nome: "Special Items",
    exemplos: "prancha, bike",
    preco_diaria: 70,
    preco_meio_periodo: 0,
    descricao: "Special Items",
  },
]

interface CategoriaMalaSelectorProps {
  value: string | null
  onSelect: (categoria: CategoriaMala) => void
}

export function CategoriaMalaSelector({ value, onSelect }: CategoriaMalaSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CATEGORIAS_MALA.map((cat) => {
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
              R$ {cat.preco_diaria}/dia
              {cat.preco_meio_periodo > 0 && ` · R$ ${cat.preco_meio_periodo}/½`}
            </span>
          </button>
        )
      })}
    </div>
  )
}
