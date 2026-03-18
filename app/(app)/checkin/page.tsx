"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Camera, Plus, X } from "lucide-react"

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
import { realizarCheckin, MalaInput } from "@/lib/actions/checkin"
import { listarParceiros, criarParceiro } from "@/lib/actions/parceiros"
import { CATEGORIAS_MALA } from "@/components/checkin/categoria-mala-selector"
import type { Parceiro } from "@/lib/types"

const checkinSchema = z.object({
  cliente_nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cliente_telefone: z.string().min(10, "Telefone inválido"),
  observacoes: z.string().optional(),
  valor_cobrado: z.coerce.number().min(0).optional(),
})

type CheckinFormValues = z.infer<typeof checkinSchema>

export default function CheckinPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [malas, setMalas] = useState<MalaInput[]>([
    { identificacao_interna: "A1", descricao: "", categoria_id: null },
  ])
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [parceiroId, setParceiroId] = useState<string | null>(null)
  const [novoParceiroNome, setNovoParceiroNome] = useState("")
  const [novoParceiroTipo, setNovoParceiroTipo] = useState("Hotel")
  const [showNovoParceiro, setShowNovoParceiro] = useState(false)
  const [criandoParceiro, setCriandoParceiro] = useState(false)

  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      cliente_nome: "",
      cliente_telefone: "",
      observacoes: "",
      valor_cobrado: undefined,
    },
  })

  useEffect(() => {
    listarParceiros().then(setParceiros)
  }, [])

  // Sugere valor_cobrado somando preços das categorias selecionadas
  useEffect(() => {
    const total = malas.reduce((sum, mala) => {
      if (!mala.categoria_id) return sum
      const cat = CATEGORIAS_MALA.find((c) => c.id === mala.categoria_id)
      return sum + (cat?.preco_diaria ?? 0)
    }, 0)

    if (total > 0) {
      const current = form.getValues("valor_cobrado")
      if (!current) {
        form.setValue("valor_cobrado", total)
      }
    }
  }, [malas, form])

  async function handleCriarParceiro() {
    if (!novoParceiroNome.trim()) return
    setCriandoParceiro(true)
    const result = await criarParceiro(novoParceiroNome.trim(), novoParceiroTipo)
    setCriandoParceiro(false)
    if (result.success && result.parceiro) {
      setParceiros((prev) => [...prev, result.parceiro!])
      setParceiroId(result.parceiro.id)
      setNovoParceiroNome("")
      setShowNovoParceiro(false)
      toast.success("Parceiro criado!")
    } else {
      toast.error(result.error ?? "Erro ao criar parceiro")
    }
  }

  async function onSubmit(values: CheckinFormValues) {
    if (malas.length === 0) {
      toast.error("Adicione pelo menos uma mala antes de registrar o check-in.")
      return
    }

    const malasValidas = malas.filter((m) => m.identificacao_interna.trim() !== "")
    if (malasValidas.length === 0) {
      toast.error("Cada mala precisa ter um ID interno.")
      return
    }

    startTransition(async () => {
      const result = await realizarCheckin({
        cliente_nome: values.cliente_nome,
        cliente_telefone: values.cliente_telefone,
        observacoes: values.observacoes || undefined,
        valor_cobrado: values.valor_cobrado,
        parceiro_id: parceiroId,
        malas: malasValidas,
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
                    <FormLabel>Nome completo</FormLabel>
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
                    <FormLabel>Telefone / WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: (11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_cobrado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor cobrado (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ex: 15.00"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            <CardContent>
              <MalaForm malas={malas} onChange={setMalas} />
            </CardContent>
          </Card>

          {/* Parceiro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parceiro <span className="text-muted-foreground font-normal text-sm">(opcional)</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={parceiroId ?? "none"}
                onValueChange={(v) => setParceiroId(v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar parceiro..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {parceiros.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} <span className="text-muted-foreground">({p.tipo})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!showNovoParceiro ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-0"
                  onClick={() => setShowNovoParceiro(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Novo parceiro
                </Button>
              ) : (
                <div className="flex gap-2 items-end flex-wrap">
                  <div className="flex-1 min-w-[140px]">
                    <Input
                      placeholder="Nome do parceiro"
                      value={novoParceiroNome}
                      onChange={(e) => setNovoParceiroNome(e.target.value)}
                    />
                  </div>
                  <Select value={novoParceiroTipo} onValueChange={setNovoParceiroTipo}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hotel">Hotel</SelectItem>
                      <SelectItem value="Airbnb">Airbnb</SelectItem>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                      <SelectItem value="Rua">Rua</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCriarParceiro}
                    disabled={criandoParceiro}
                  >
                    {criandoParceiro ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Criar"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNovoParceiro(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
