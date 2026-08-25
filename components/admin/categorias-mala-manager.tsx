"use client"

import { useState, useTransition } from "react"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  atualizarCategoriaMala,
  criarCategoriaMala,
  excluirCategoriaMala,
  toggleCategoriaMalaAtiva,
  type CategoriaMala,
  type CategoriaMalaInput,
} from "@/lib/actions/categorias-mala"

const EMPTY_FORM: CategoriaMalaInput = {
  emoji: "🧳",
  nome: "",
  exemplos: "",
  descricao: "",
  preco_diaria: 0,
  preco_meio_periodo: 0,
  ordem: 0,
}

function ordenar(categorias: CategoriaMala[]) {
  return [...categorias].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"))
}

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)
}

interface CategoriaDialogProps {
  categoria?: CategoriaMala
  onSaved: (categoria: CategoriaMala) => void
}

function CategoriaDialog({ categoria, onSaved }: CategoriaDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<CategoriaMalaInput>(EMPTY_FORM)

  function resetForm() {
    setForm(
      categoria
        ? {
            emoji: categoria.emoji,
            nome: categoria.nome,
            exemplos: categoria.exemplos,
            descricao: categoria.descricao,
            preco_diaria: categoria.preco_diaria,
            preco_meio_periodo: categoria.preco_meio_periodo,
            ordem: categoria.ordem,
          }
        : EMPTY_FORM
    )
  }

  function handleOpenChange(value: boolean) {
    if (value) resetForm()
    setOpen(value)
  }

  function update<K extends keyof CategoriaMalaInput>(key: K, value: CategoriaMalaInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const result = categoria
        ? await atualizarCategoriaMala(categoria.id, form)
        : await criarCategoriaMala(form)

      if (!result.success || !result.categoria) {
        toast.error(result.error || "Não foi possível salvar a categoria")
        return
      }

      onSaved(result.categoria)
      setOpen(false)
      toast.success(categoria ? "Categoria atualizada" : "Categoria criada")
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {categoria ? (
          <Button variant="ghost" size="icon" title="Editar categoria">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova categoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{categoria ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            Defina como a categoria será exibida e qual valor será sugerido no check-in.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor={`emoji-${categoria?.id ?? "nova"}`}>Emoji</Label>
            <Input
              id={`emoji-${categoria?.id ?? "nova"}`}
              value={form.emoji}
              onChange={(event) => update("emoji", event.target.value)}
              maxLength={16}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`ordem-${categoria?.id ?? "nova"}`}>Ordem</Label>
            <Input
              id={`ordem-${categoria?.id ?? "nova"}`}
              type="number"
              min="0"
              max="9999"
              value={form.ordem ?? 0}
              onChange={(event) => update("ordem", Number(event.target.value))}
              required
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor={`nome-${categoria?.id ?? "nova"}`}>Nome</Label>
            <Input
              id={`nome-${categoria?.id ?? "nova"}`}
              value={form.nome}
              onChange={(event) => update("nome", event.target.value)}
              maxLength={80}
              required
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor={`exemplos-${categoria?.id ?? "nova"}`}>Exemplos</Label>
            <Input
              id={`exemplos-${categoria?.id ?? "nova"}`}
              value={form.exemplos ?? ""}
              onChange={(event) => update("exemplos", event.target.value)}
              placeholder="Ex: bolsa, mochila pequena"
              maxLength={160}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor={`descricao-${categoria?.id ?? "nova"}`}>Descrição aplicada à mala</Label>
            <Input
              id={`descricao-${categoria?.id ?? "nova"}`}
              value={form.descricao ?? ""}
              onChange={(event) => update("descricao", event.target.value)}
              placeholder="Se vazio, usa o nome"
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`diaria-${categoria?.id ?? "nova"}`}>Diária (R$)</Label>
            <Input
              id={`diaria-${categoria?.id ?? "nova"}`}
              type="number"
              min="0"
              step="0.01"
              value={form.preco_diaria}
              onChange={(event) => update("preco_diaria", Number(event.target.value))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`meio-${categoria?.id ?? "nova"}`}>Meio período (R$)</Label>
            <Input
              id={`meio-${categoria?.id ?? "nova"}`}
              type="number"
              min="0"
              step="0.01"
              value={form.preco_meio_periodo}
              onChange={(event) => update("preco_meio_periodo", Number(event.target.value))}
              required
            />
          </div>
          <Button type="submit" className="col-span-2" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar categoria
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CategoriasMalaManager({ categoriasIniciais }: { categoriasIniciais: CategoriaMala[] }) {
  const [categorias, setCategorias] = useState(() => ordenar(categoriasIniciais))
  const [isPending, startTransition] = useTransition()

  function upsert(categoria: CategoriaMala) {
    setCategorias((current) => ordenar([...current.filter((item) => item.id !== categoria.id), categoria]))
  }

  function toggle(categoria: CategoriaMala) {
    startTransition(async () => {
      const result = await toggleCategoriaMalaAtiva(categoria.id, !categoria.ativo)
      if (!result.success || !result.categoria) {
        toast.error(result.error || "Não foi possível alterar a categoria")
        return
      }
      upsert(result.categoria)
      toast.success(result.categoria.ativo ? "Categoria ativada" : "Categoria desativada")
    })
  }

  function excluir(categoria: CategoriaMala) {
    if (!window.confirm(`Excluir a categoria “${categoria.nome}”?`)) return
    startTransition(async () => {
      const result = await excluirCategoriaMala(categoria.id)
      if (!result.success) {
        toast.error(result.error || "Não foi possível excluir a categoria")
        return
      }
      setCategorias((current) => current.filter((item) => item.id !== categoria.id))
      toast.success("Categoria excluída")
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CategoriaDialog onSaved={upsert} />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {categorias.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Diária</th>
                  <th className="px-4 py-3 font-medium">Meio período</th>
                  <th className="px-4 py-3 font-medium">Ordem</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria) => (
                  <tr key={categoria.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{categoria.emoji} {categoria.nome}</div>
                      <div className="text-xs text-slate-500">{categoria.exemplos || categoria.descricao}</div>
                    </td>
                    <td className="px-4 py-3">{moeda(categoria.preco_diaria)}</td>
                    <td className="px-4 py-3">{moeda(categoria.preco_meio_periodo)}</td>
                    <td className="px-4 py-3">{categoria.ordem}</td>
                    <td className="px-4 py-3">
                      <Badge className={categoria.ativo ? "border-0 bg-green-100 text-green-700 hover:bg-green-100" : "border-0 bg-slate-100 text-slate-600 hover:bg-slate-100"}>
                        {categoria.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <CategoriaDialog categoria={categoria} onSaved={upsert} />
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => toggle(categoria)}
                        >
                          {categoria.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => excluir(categoria)}
                          title="Excluir categoria"
                          className="text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
