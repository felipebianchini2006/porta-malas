"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Edit3, Eye, Plus, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { salvarParceiro, type ParceiroDetalhado, type ParceiroInput } from "@/lib/actions/parceiros"
import type { GrupoParceiro, StatusParceiro } from "@/lib/types"

const CATEGORIAS: Record<GrupoParceiro, string[]> = {
  Hospedagem: ["Superhost/Airbnb", "Coanfitrião", "Gestor", "Hotel", "Hostel", "Pousada", "Administradora"],
  "Indicação Local": ["Porteiro", "Concierge", "Loja", "Cafeteria", "Restaurante", "Comércio", "Guia", "Outro"],
}

const STATUS_LABEL: Record<StatusParceiro, string> = {
  pendente_cadastro: "Pendente de cadastro",
  pendente_financeiro: "Pendente financeiro",
  ativo: "Ativo",
  inativo: "Inativo",
  bloqueado: "Bloqueado",
}

const emptyForm: ParceiroInput = {
  nome: "",
  grupo: "Hospedagem",
  categoria: "Hotel",
  desconto_percentual: 5,
  comissao_percentual: 5,
  dia_repasse: 20,
  status: "pendente_cadastro",
}

function fromParceiro(parceiro: ParceiroDetalhado): ParceiroInput {
  return {
    nome: parceiro.nome,
    nome_completo_razao_social: parceiro.nome_completo_razao_social ?? "",
    nome_fantasia: parceiro.nome_fantasia ?? "",
    pessoa_tipo: parceiro.pessoa_tipo ?? "",
    documento: parceiro.documento ?? "",
    grupo: parceiro.grupo,
    categoria: parceiro.categoria,
    whatsapp: parceiro.whatsapp ?? "",
    email: parceiro.email ?? "",
    instagram: parceiro.instagram ?? "",
    site: parceiro.site ?? "",
    endereco: parceiro.endereco ?? "",
    numero: parceiro.numero ?? "",
    complemento: parceiro.complemento ?? "",
    bairro: parceiro.bairro ?? "",
    cidade: parceiro.cidade ?? "",
    uf: parceiro.uf ?? "",
    cep: parceiro.cep ?? "",
    codigo_indicacao: parceiro.codigo_indicacao,
    desconto_percentual: parceiro.desconto_percentual,
    comissao_percentual: parceiro.comissao_percentual,
    dia_repasse: parceiro.dia_repasse,
    pix_tipo: parceiro.pix_tipo ?? "",
    pix_chave: parceiro.pix_chave ?? "",
    pix_titular: parceiro.pix_titular ?? "",
    pix_documento_titular: parceiro.pix_documento_titular ?? "",
    status: parceiro.status,
    observacoes: parceiro.observacoes ?? "",
    nome_airbnb: parceiro.nome_airbnb ?? "",
    quantidade_unidades: parceiro.quantidade_unidades,
    bairros_atendidos: parceiro.bairros_atendidos ?? "",
    empresa_gestora: parceiro.empresa_gestora ?? "",
  }
}

interface ParceirosManagerProps {
  parceirosIniciais: ParceiroDetalhado[]
}

export function ParceirosManager({ parceirosIniciais }: ParceirosManagerProps) {
  const [parceiros, setParceiros] = useState(parceirosIniciais)
  const [form, setForm] = useState<ParceiroInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function update<K extends keyof ParceiroInput>(key: K, value: ParceiroInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function openNew() {
    setEditingId(undefined)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(parceiro: ParceiroDetalhado) {
    setEditingId(parceiro.id)
    setForm(fromParceiro(parceiro))
    setOpen(true)
  }

  function save() {
    startTransition(async () => {
      const result = await salvarParceiro(form, editingId)
      if (!result.success || !result.parceiro) {
        toast.error(result.error ?? "Não foi possível salvar")
        return
      }
      setParceiros((current) => {
        const without = current.filter((item) => item.id !== result.parceiro!.id)
        return [...without, result.parceiro!].sort((a, b) => a.nome.localeCompare(b.nome))
      })
      toast.success(editingId ? "Parceiro atualizado" : "Parceiro criado")
      setOpen(false)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}><Plus className="h-4 w-4" />Novo parceiro</Button>
      </div>

      {parceiros.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nenhum parceiro cadastrado.</CardContent></Card>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Parceiro</th><th className="px-4 py-3">Grupo</th><th className="px-4 py-3">Código</th><th className="px-4 py-3">Regra</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y">
                {parceiros.map((parceiro) => (
                  <tr key={parceiro.id}>
                    <td className="px-4 py-3"><p className="font-medium text-slate-900">{parceiro.nome}</p><p className="text-xs text-muted-foreground">{parceiro.categoria}</p></td>
                    <td className="px-4 py-3">{parceiro.grupo}</td>
                    <td className="px-4 py-3 font-mono text-xs">{parceiro.codigo_indicacao}</td>
                    <td className="px-4 py-3 text-xs">{parceiro.desconto_percentual}% desc. · {parceiro.comissao_percentual}% comissão · dia {parceiro.dia_repasse}</td>
                    <td className="px-4 py-3">{STATUS_LABEL[parceiro.status]}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" asChild><Link href={`/admin/parceiros/${parceiro.id}`} aria-label="Abrir extrato"><Eye className="h-4 w-4" /></Link></Button><Button variant="ghost" size="icon" onClick={() => openEdit(parceiro)} aria-label="Editar parceiro"><Edit3 className="h-4 w-4" /></Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Editar parceiro" : "Novo parceiro"}</DialogTitle><DialogDescription>Cadastre identificação, operação e dados financeiros. Campos financeiros ficam restritos ao administrador.</DialogDescription></DialogHeader>
          <div className="space-y-6">
            <Section title="Identificação">
              <Field label="Nome do parceiro *"><Input value={form.nome} onChange={(event) => update("nome", event.target.value)} /></Field>
              <Field label="Nome completo / Razão social"><Input value={form.nome_completo_razao_social ?? ""} onChange={(event) => update("nome_completo_razao_social", event.target.value)} /></Field>
              <Field label="Nome fantasia"><Input value={form.nome_fantasia ?? ""} onChange={(event) => update("nome_fantasia", event.target.value)} /></Field>
              <Field label="PF / PJ"><Select value={form.pessoa_tipo || "none"} onValueChange={(value) => update("pessoa_tipo", value === "none" ? "" : value as "PF" | "PJ")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Não informado</SelectItem><SelectItem value="PF">Pessoa física</SelectItem><SelectItem value="PJ">Pessoa jurídica</SelectItem></SelectContent></Select></Field>
              <Field label="CPF / CNPJ"><Input value={form.documento ?? ""} onChange={(event) => update("documento", event.target.value)} /></Field>
              <Field label="Status"><Select value={form.status} onValueChange={(value) => update("status", value as StatusParceiro)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUS_LABEL).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field>
            </Section>

            <Section title="Contato e localização">
              <Field label="WhatsApp"><Input value={form.whatsapp ?? ""} onChange={(event) => update("whatsapp", event.target.value)} /></Field>
              <Field label="E-mail"><Input type="email" value={form.email ?? ""} onChange={(event) => update("email", event.target.value)} /></Field>
              <Field label="Instagram"><Input value={form.instagram ?? ""} onChange={(event) => update("instagram", event.target.value)} /></Field>
              <Field label="Site"><Input value={form.site ?? ""} onChange={(event) => update("site", event.target.value)} /></Field>
              <Field label="Endereço"><Input value={form.endereco ?? ""} onChange={(event) => update("endereco", event.target.value)} /></Field>
              <Field label="Número"><Input value={form.numero ?? ""} onChange={(event) => update("numero", event.target.value)} /></Field>
              <Field label="Complemento"><Input value={form.complemento ?? ""} onChange={(event) => update("complemento", event.target.value)} /></Field>
              <Field label="Bairro"><Input value={form.bairro ?? ""} onChange={(event) => update("bairro", event.target.value)} /></Field>
              <Field label="Cidade"><Input value={form.cidade ?? ""} onChange={(event) => update("cidade", event.target.value)} /></Field>
              <Field label="UF"><Input maxLength={2} value={form.uf ?? ""} onChange={(event) => update("uf", event.target.value)} /></Field>
              <Field label="CEP"><Input value={form.cep ?? ""} onChange={(event) => update("cep", event.target.value)} /></Field>
            </Section>

            <Section title="Operação e comissão">
              <Field label="Grupo"><Select value={form.grupo} onValueChange={(value) => { const grupo = value as GrupoParceiro; update("grupo", grupo); update("categoria", CATEGORIAS[grupo][0]); update("dia_repasse", grupo === "Hospedagem" ? 20 : 15) }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Hospedagem">Hospedagem</SelectItem><SelectItem value="Indicação Local">Indicação local</SelectItem></SelectContent></Select></Field>
              <Field label="Categoria *"><Select value={form.categoria} onValueChange={(value) => update("categoria", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIAS[form.grupo].map((categoria) => <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Código de indicação"><Input placeholder="Gerado automaticamente" value={form.codigo_indicacao ?? ""} onChange={(event) => update("codigo_indicacao", event.target.value)} /></Field>
              <Field label="Desconto ao cliente (%)"><Input type="number" min="0" max="100" step="0.01" value={form.desconto_percentual} onChange={(event) => update("desconto_percentual", Number(event.target.value))} /></Field>
              <Field label="Comissão do parceiro (%)"><Input type="number" min="0" max="100" step="0.01" value={form.comissao_percentual} onChange={(event) => update("comissao_percentual", Number(event.target.value))} /></Field>
              <Field label="Dia do repasse"><Input type="number" min="1" max="28" value={form.dia_repasse} onChange={(event) => update("dia_repasse", Number(event.target.value))} /></Field>
            </Section>

            <Section title="Dados financeiros">
              <Field label="Tipo de chave PIX"><Input value={form.pix_tipo ?? ""} onChange={(event) => update("pix_tipo", event.target.value)} /></Field>
              <Field label="Chave PIX"><Input value={form.pix_chave ?? ""} onChange={(event) => update("pix_chave", event.target.value)} /></Field>
              <Field label="Titular"><Input value={form.pix_titular ?? ""} onChange={(event) => update("pix_titular", event.target.value)} /></Field>
              <Field label="CPF / CNPJ do titular"><Input value={form.pix_documento_titular ?? ""} onChange={(event) => update("pix_documento_titular", event.target.value)} /></Field>
            </Section>

            {form.grupo === "Hospedagem" && <Section title="Hospedagem"><Field label="Nome no Airbnb"><Input value={form.nome_airbnb ?? ""} onChange={(event) => update("nome_airbnb", event.target.value)} /></Field><Field label="Imóveis / unidades"><Input type="number" min="0" value={form.quantidade_unidades ?? ""} onChange={(event) => update("quantidade_unidades", event.target.value ? Number(event.target.value) : null)} /></Field><Field label="Bairros atendidos"><Input value={form.bairros_atendidos ?? ""} onChange={(event) => update("bairros_atendidos", event.target.value)} /></Field><Field label="Empresa gestora"><Input value={form.empresa_gestora ?? ""} onChange={(event) => update("empresa_gestora", event.target.value)} /></Field></Section>}

            <div><Label>Observações</Label><Textarea className="mt-1" rows={3} value={form.observacoes ?? ""} onChange={(event) => update("observacoes", event.target.value)} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} disabled={isPending || !form.nome.trim() || !form.categoria.trim()}><Save className="h-4 w-4" />{isPending ? "Salvando..." : "Salvar parceiro"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="mb-3 border-b pb-2 text-sm font-semibold text-slate-800">{title}</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div></section>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>
}
