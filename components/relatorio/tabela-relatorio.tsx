"use client"

import { useState, useTransition } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { excluirAtendimento } from "@/lib/actions/atendimentos"
import { type RelatorioAtendimento } from "@/lib/actions/relatorio"

interface TabelaRelatorioProps {
  atendimentos: RelatorioAtendimento[]
  dataInicio: string
  dataFim: string
  canDelete: boolean
  onAtendimentoExcluido: () => void
}

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
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

interface ExcluirAtendimentoDialogProps {
  atendimento: RelatorioAtendimento
  onDeleted: () => void
}

function ExcluirAtendimentoDialog({ atendimento, onDeleted }: ExcluirAtendimentoDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmacao, setConfirmacao] = useState("")
  const [isPending, startTransition] = useTransition()
  const confirmado = confirmacao === atendimento.protocolo

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value) setConfirmacao("")
  }

  function handleExcluir() {
    if (!confirmado) return
    startTransition(async () => {
      const result = await excluirAtendimento({
        atendimentoId: atendimento.id,
        protocoloConfirmacao: confirmacao,
      })
      if (!result.success) {
        toast.error(result.error || "Não foi possível excluir o atendimento")
        return
      }

      handleOpenChange(false)
      if (result.warning) toast.warning(result.warning)
      else toast.success("Atendimento excluído")
      onDeleted()
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title={`Excluir atendimento ${atendimento.protocolo}`}
        className="text-slate-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Excluir atendimento {atendimento.protocolo}</span>
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir atendimento?</DialogTitle>
          <DialogDescription>
            Esta ação remove permanentemente o atendimento, as malas e as fotos vinculadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Para confirmar, digite o protocolo <strong>{atendimento.protocolo}</strong>.
          </div>
          <div className="space-y-2">
            <Label htmlFor={`confirmar-exclusao-${atendimento.id}`}>Protocolo</Label>
            <Input
              id={`confirmar-exclusao-${atendimento.id}`}
              value={confirmacao}
              onChange={(event) => setConfirmacao(event.target.value)}
              autoComplete="off"
              placeholder={atendimento.protocolo}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              disabled={!confirmado || isPending}
              onClick={handleExcluir}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir definitivamente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TabelaRelatorio({
  atendimentos,
  dataInicio,
  dataFim,
  canDelete,
  onAtendimentoExcluido,
}: TabelaRelatorioProps) {
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null)

  async function handleExport(formato: "csv" | "xlsx") {
    setExporting(formato)
    try {
      const params = new URLSearchParams({ formato, inicio: dataInicio, fim: dataFim })
      const response = await fetch(`/api/export?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Erro ao exportar")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-${dataInicio}_${dataFim}.${formato}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Erro ao exportar:", err)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {atendimentos.length} atendimento{atendimentos.length !== 1 ? "s" : ""} encontrado{atendimentos.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            disabled={exporting !== null || atendimentos.length === 0}
          >
            {exporting === "csv" ? "Exportando..." : "Exportar CSV"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("xlsx")}
            disabled={exporting !== null || atendimentos.length === 0}
          >
            {exporting === "xlsx" ? "Exportando..." : "Exportar Excel"}
          </Button>
        </div>
      </div>

      {atendimentos.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum atendimento encontrado no período selecionado.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-center">Qtd. Malas</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Retirada</TableHead>
              {canDelete && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {atendimentos.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <span className="rounded bg-violet-100 px-2 py-0.5 font-mono text-xs text-violet-700">
                    {a.protocolo}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{a.cliente_nome}</TableCell>
                <TableCell className="text-sm text-slate-600">{a.cliente_telefone}</TableCell>
                <TableCell className="text-center text-sm">{a.qtd_malas}</TableCell>
                <TableCell className="text-sm">{formatCurrency(a.valor_cobrado)}</TableCell>
                <TableCell>
                  {a.status === "ativo" ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Em Guarda
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      Retirado
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{formatDate(a.data_checkin)}</TableCell>
                <TableCell className="text-sm">{formatDate(a.data_retirada)}</TableCell>
                {canDelete && (
                  <TableCell className="text-right">
                    <ExcluirAtendimentoDialog
                      atendimento={a}
                      onDeleted={onAtendimentoExcluido}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
