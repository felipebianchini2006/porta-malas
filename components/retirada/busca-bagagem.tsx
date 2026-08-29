"use client"

import { useState, useCallback, useTransition, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { buscarAtendimento } from "@/lib/actions/retirada"
import type { FormaPagamento } from "@/lib/utils/payment"

export interface AtendimentoResult {
  id: string
  protocolo: string
  cliente_nome: string
  cliente_telefone: string
  observacoes: string | null
  valor_cobrado: number | null
  forma_pagamento: FormaPagamento | null
  status: string
  data_checkin: string
  malas: {
    id: string
    identificacao_interna: string
    descricao: string | null
    status: string
  }[]
}

interface BuscaBagemProps {
  onResultados: (atendimentos: AtendimentoResult[]) => void
  initialQuery?: string | null
}

export function BuscaBagagem({ onResultados, initialQuery }: BuscaBagemProps) {
  const [query, setQuery] = useState(initialQuery ?? "")
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        startTransition(async () => {
          const result = await buscarAtendimento(value)
          onResultados(result.atendimentos)
        })
      }, 300)
    },
    [onResultados]
  )

  // Auto-search when initialQuery is provided
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    handleSearch(value)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por protocolo, nome ou telefone..."
          value={query}
          onChange={handleChange}
          className="pl-9 pr-9"
          autoFocus
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>
    </div>
  )
}
