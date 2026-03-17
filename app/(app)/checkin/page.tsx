"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Camera } from "lucide-react"

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
import { MalaForm } from "@/components/checkin/mala-form"
import { realizarCheckin, MalaInput } from "@/lib/actions/checkin"

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
    { identificacao_interna: "A1", descricao: "" },
  ])

  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      cliente_nome: "",
      cliente_telefone: "",
      observacoes: "",
      valor_cobrado: undefined,
    },
  })

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
