"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MalaInput } from "@/lib/actions/checkin"
import { Plus, X } from "lucide-react"

interface MalaFormProps {
  malas: MalaInput[]
  onChange: (malas: MalaInput[]) => void
}

function gerarId(index: number): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  return `${letters[Math.floor(index / 10) % 26] ?? "A"}${(index % 10) + 1}`
}

export function MalaForm({ malas, onChange }: MalaFormProps) {
  function adicionarMala() {
    const novaId = gerarId(malas.length)
    onChange([...malas, { identificacao_interna: novaId, descricao: "" }])
  }

  function removerMala(index: number) {
    onChange(malas.filter((_, i) => i !== index))
  }

  function atualizarMala(index: number, campo: keyof MalaInput, valor: string) {
    const novasMalas = malas.map((mala, i) =>
      i === index ? { ...mala, [campo]: valor } : mala
    )
    onChange(novasMalas)
  }

  return (
    <div className="space-y-3">
      {malas.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma mala adicionada. Clique em &quot;Adicionar Mala&quot; para começar.
        </p>
      )}

      {malas.map((mala, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-3 border rounded-md bg-slate-50"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0">
            {index + 1}
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2">
            <Input
              placeholder="ID Interno (ex: A1)"
              value={mala.identificacao_interna}
              onChange={(e) => atualizarMala(index, "identificacao_interna", e.target.value)}
              className="bg-white"
            />
            <Input
              placeholder="Descrição (ex: mochila preta)"
              value={mala.descricao ?? ""}
              onChange={(e) => atualizarMala(index, "descricao", e.target.value)}
              className="bg-white"
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removerMala(index)}
            className="shrink-0 text-slate-400 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={adicionarMala}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Mala
      </Button>
    </div>
  )
}
