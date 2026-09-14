"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Calculator, Loader2, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MalaForm } from "@/components/checkin/mala-form"
import { PartnerQrScanner } from "@/components/checkin/partner-qr-scanner"
import { realizarCheckin, MalaInput } from "@/lib/actions/checkin"
import { calcularTotalMalas } from "@/lib/utils/checkin-price"
import { calcularProgramaParceiro, categoriaPodeReceberDescontoParceiro } from "@/lib/utils/partner-program"
import type { CategoriaMala } from "@/lib/actions/categorias-mala"
import type { Parceiro } from "@/lib/types"
import { telefoneValido } from "@/lib/utils/telefone"
import { FORMAS_PAGAMENTO, OPCOES_FORMA_PAGAMENTO } from "@/lib/utils/payment"
import { encontrarParceiroAtivoPorCodigo } from "@/lib/utils/partner-referral"

const checkinSchema = z.object({
  cliente_nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cliente_documento_tipo: z.enum(["CPF", "Passaporte"], {
    required_error: "Selecione o tipo de documento",
  }),
  cliente_documento: z.string().trim().min(3, "CPF ou passaporte é obrigatório"),
  cliente_telefone: z.string().refine(telefoneValido, "Informe um telefone com código do país"),
  observacoes: z.string().optional(),
  valor_cobrado: z.coerce.number().min(0).optional(),
  forma_pagamento: z.enum(FORMAS_PAGAMENTO, {
    required_error: "Selecione a forma de pagamento",
  }),
})

type CheckinFormValues = z.infer<typeof checkinSchema>

interface CheckinFormProps {
  parceirosIniciais: Parceiro[]
  categorias: CategoriaMala[]
  codigoParceiroInicial?: string
}

export function CheckinForm({ parceirosIniciais, categorias, codigoParceiroInicial }: CheckinFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [malas, setMalas] = useState<MalaInput[]>([
    { identificacao_interna: "A1", descricao: "", categoria_id: null },
  ])
  const [parceiroId, setParceiroId] = useState<string | null>(() =>
    encontrarParceiroAtivoPorCodigo(parceirosIniciais, codigoParceiroInicial)?.id ?? null
  )

  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      cliente_nome: "",
      cliente_documento_tipo: "CPF",
      cliente_documento: "",
      cliente_telefone: "",
      observacoes: "",
      valor_cobrado: undefined,
      forma_pagamento: undefined,
    },
  })

  const parceiroSelecionado = parceirosIniciais.find((parceiro) => parceiro.id === parceiroId)
  const categoriasDisponiveis = parceiroSelecionado
    ? categorias.filter(categoriaPodeReceberDescontoParceiro)
    : categorias

  function selecionarParceiro(value: string) {
    const id = value === "none" ? null : value
    setParceiroId(id)
    if (!id) return
    const idsPermitidos = new Set(categorias.filter(categoriaPodeReceberDescontoParceiro).map((categoria) => categoria.id))
    setMalas((current) => current.map((mala) =>
      mala.categoria_id && !idsPermitidos.has(mala.categoria_id)
        ? { ...mala, categoria_id: null, descricao: "" }
        : mala
    ))
  }

  useEffect(() => {
    const valorBase = calcularTotalMalas(malas, categorias)
    const total = parceiroSelecionado
      ? calcularProgramaParceiro({
          valorBase,
          descontoPercentual: parceiroSelecionado.desconto_percentual,
          comissaoPercentual: parceiroSelecionado.comissao_percentual,
        }).valorCobrado
      : valorBase
    form.setValue("valor_cobrado", total > 0 ? total : undefined)
  }, [malas, categorias, form, parceiroSelecionado])

  async function onSubmit(values: CheckinFormValues) {
    if (malas.length === 0) {
      toast.error("Adicione pelo menos uma mala antes de registrar o check-in.")
      return
    }

    if (malas.some((m) => !m.identificacao_interna.trim())) {
      toast.error("Informe o lacre de todas as malas.")
      return
    }

    startTransition(async () => {
      const result = await realizarCheckin({
        cliente_nome: values.cliente_nome,
        cliente_documento_tipo: values.cliente_documento_tipo,
        cliente_documento: values.cliente_documento,
        cliente_telefone: values.cliente_telefone,
        observacoes: values.observacoes || undefined,
        valor_cobrado: values.valor_cobrado,
        forma_pagamento: values.forma_pagamento,
        parceiro_id: parceiroId,
        malas,
      })

      if (!result.success) {
        toast.error(result.error ?? "Erro ao registrar check-in.")
        return
      }

      toast.success("Check-in realizado!")
      router.push(`/checkin/${result.atendimento_id}`)
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Novo Check-in</h1>
        <p className="text-sm text-muted-foreground mt-1">Registre a entrada de bagagens</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="cliente_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone / WhatsApp *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        autoComplete="tel"
                        placeholder="Ex: +55 11 99999-9999"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Para estrangeiros, inclua + e o código do país.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                <FormField
                  control={form.control}
                  name="cliente_documento_tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="CPF">CPF</SelectItem><SelectItem value="Passaporte">Passaporte</SelectItem></SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cliente_documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do documento *</FormLabel>
                      <FormControl><Input placeholder="Informe o CPF ou passaporte" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Input placeholder="Alguma observação importante?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Malas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Malas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <MalaForm malas={malas} categorias={categoriasDisponiveis} onChange={setMalas} />

              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
                <FormField
                  control={form.control}
                  name="valor_cobrado"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <Calculator className="h-5 w-5" />
                          </div>
                          <div>
                            <FormLabel className="text-base font-semibold text-slate-800">
                              Total do atendimento
                            </FormLabel>
                            <p className="mt-1 text-xs text-slate-600">
                              Somado automaticamente pelas malas. Você ainda pode editar.
                            </p>
                          </div>
                        </div>
                        <FormControl>
                          <div className="relative w-full sm:w-40">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                              R$
                            </span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              aria-label="Valor total do atendimento"
                              className="bg-white pl-10 text-right text-lg font-semibold"
                              placeholder="0,00"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-4 border-t border-amber-200 pt-4">
                  <FormField
                    control={form.control}
                    name="forma_pagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de pagamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Selecione como foi pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {OPCOES_FORMA_PAGAMENTO.map((opcao) => (
                              <SelectItem key={opcao.value} value={opcao.value}>
                                {opcao.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parceiro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parceiro <span className="text-muted-foreground font-normal text-sm">(opcional)</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PartnerQrScanner parceiros={parceirosIniciais} onParceiroEncontrado={selecionarParceiro} />

              <Select
                value={parceiroId ?? "none"}
                onValueChange={selecionarParceiro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar parceiro..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {parceirosIniciais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} <span className="text-muted-foreground">({p.tipo})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {parceiroSelecionado && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  Código {parceiroSelecionado.codigo_indicacao} · {parceiroSelecionado.desconto_percentual}% de desconto ao cliente · {parceiroSelecionado.comissao_percentual}% de comissão.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fotos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Camera className="h-5 w-5 shrink-0" />
                <p>
                  Fotos podem ser adicionadas após o check-in, na página de detalhes do atendimento.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar Check-in"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
