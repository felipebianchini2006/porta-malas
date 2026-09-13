"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Download, ExternalLink, RefreshCw, Save } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { atualizarRepasse, listarRepasses, type Repasse } from "@/lib/actions/repasses"
import type { StatusRepasse } from "@/lib/utils/partner-program"

const STATUS: Record<StatusRepasse, string> = {
  em_aberto: "Em aberto",
  programado: "Programado",
  pago: "Pago",
  vencido: "Vencido",
  bloqueado: "Bloqueado",
}

const STATUS_CLASS: Record<StatusRepasse, string> = {
  em_aberto: "border-0 bg-blue-100 text-blue-700",
  programado: "border-0 bg-violet-100 text-violet-700",
  pago: "border-0 bg-green-100 text-green-700",
  vencido: "border-0 bg-red-100 text-red-700",
  bloqueado: "border-0 bg-slate-200 text-slate-700",
}

function moeda(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function data(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-")
  return `${day}/${month}/${year}`
}

export function RepassesManager({ competenciaInicial, repassesIniciais }: { competenciaInicial: string; repassesIniciais: Repasse[] }) {
  const [competencia, setCompetencia] = useState(competenciaInicial)
  const [repasses, setRepasses] = useState(repassesIniciais)
  const [status, setStatus] = useState<Record<string, StatusRepasse>>(() => Object.fromEntries(repassesIniciais.map((item) => [item.id, item.status])))
  const [referencias, setReferencias] = useState<Record<string, string>>(() => Object.fromEntries(repassesIniciais.map((item) => [item.id, item.comprovante ?? ""])))
  const [isPending, startTransition] = useTransition()

  const totais = repasses.reduce((total, item) => ({
    malas: total.malas + item.quantidade_malas,
    bruto: total.bruto + item.valor_bruto,
    desconto: total.desconto + item.desconto_total,
    comissao: total.comissao + item.comissao_total,
    liquido: total.liquido + item.valor_liquido_bagpoint,
  }), { malas: 0, bruto: 0, desconto: 0, comissao: 0, liquido: 0 })

  function carregar() {
    startTransition(async () => {
      const items = await listarRepasses(competencia)
      setRepasses(items)
      setStatus(Object.fromEntries(items.map((item) => [item.id, item.status])))
      setReferencias(Object.fromEntries(items.map((item) => [item.id, item.comprovante ?? ""])))
    })
  }

  function salvar(item: Repasse) {
    const novoStatus = status[item.id] ?? item.status
    startTransition(async () => {
      const result = await atualizarRepasse(item.id, novoStatus, referencias[item.id])
      if (!result.success) {
        toast.error(result.error ?? "Não foi possível atualizar")
        return
      }
      toast.success("Repasse atualizado e registrado no histórico")
      const items = await listarRepasses(competencia)
      setRepasses(items)
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border bg-white p-4">
        <div className="space-y-1">
          <label htmlFor="competencia" className="text-sm font-medium">Competência</label>
          <Input id="competencia" type="month" value={competencia} onChange={(event) => setCompetencia(event.target.value)} className="w-48" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={carregar} disabled={isPending}><RefreshCw className="h-4 w-4" />Atualizar</Button>
          {repasses.length > 0 ? <Button asChild><a href={`/api/export/parceiros?competencia=${competencia}`}><Download className="h-4 w-4" />Exportar Excel</a></Button> : <Button disabled><Download className="h-4 w-4" />Exportar Excel</Button>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Parceiros" value={String(repasses.length)} />
        <Stat label="Malas indicadas" value={String(totais.malas)} />
        <Stat label="Valor bruto" value={moeda(totais.bruto)} />
        <Stat label="Comissões" value={moeda(totais.comissao)} />
        <Stat label="Líquido BagPoint" value={moeda(totais.liquido)} />
      </div>

      {repasses.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nenhum repasse encontrado nesta competência.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Parceiro</th><th className="px-4 py-3">Volume</th><th className="px-4 py-3">Composição</th><th className="px-4 py-3">PIX</th><th className="px-4 py-3">Prazo</th><th className="px-4 py-3">Status e baixa</th><th className="px-4 py-3"></th></tr></thead>
            <tbody className="divide-y">
              {repasses.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-3"><Link href={`/admin/parceiros/${item.parceiro_id}`} className="font-medium text-violet-700 hover:underline">{item.parceiro_nome}<ExternalLink className="ml-1 inline h-3 w-3" /></Link><p className="font-mono text-xs text-muted-foreground">{item.codigo_indicacao}</p></td>
                  <td className="px-4 py-3">{item.quantidade_atendimentos} check-ins<br /><span className="text-muted-foreground">{item.quantidade_malas} malas</span></td>
                  <td className="px-4 py-3"><p>Bruto: {moeda(item.valor_bruto)}</p><p className="text-xs text-muted-foreground">Desconto: {moeda(item.desconto_total)}</p><p className="font-medium text-green-700">Comissão: {moeda(item.comissao_total)}</p></td>
                  <td className="max-w-52 px-4 py-3"><p className="break-all">{item.pix_chave || "Não cadastrado"}</p><p className="text-xs text-muted-foreground">{item.pix_titular}</p></td>
                  <td className="px-4 py-3"><p>{data(item.vencimento)}</p><Badge className={STATUS_CLASS[item.status]}>{STATUS[item.status]}</Badge>{item.status !== "pago" && item.dias_restantes <= 5 && <p className="mt-1 text-xs font-medium text-red-600">{item.dias_restantes < 0 ? `${Math.abs(item.dias_restantes)} dia(s) em atraso` : `${item.dias_restantes} dia(s) para vencer`}</p>}</td>
                  <td className="w-64 space-y-2 px-4 py-3"><Select value={status[item.id] ?? item.status} onValueChange={(value) => setStatus((current) => ({ ...current, [item.id]: value as StatusRepasse }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>{status[item.id] === "pago" && <Input placeholder="Referência do comprovante *" value={referencias[item.id] ?? ""} onChange={(event) => setReferencias((current) => ({ ...current, [item.id]: event.target.value }))} />}</td>
                  <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => salvar(item)} disabled={isPending}><Save className="h-4 w-4" />Salvar</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Descontos no período: {moeda(totais.desconto)}. Toda alteração de status gera um evento de auditoria.</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold text-slate-800">{value}</p></CardContent></Card>
}
