"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { registrarAceite } from "@/lib/actions/aceite"

interface AceiteFormProps {
  token: string
  alreadyAccepted: boolean
}

export function AceiteForm({ token, alreadyAccepted }: AceiteFormProps) {
  const [accepted, setAccepted] = useState(alreadyAccepted)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (accepted) {
    return <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-4 font-medium text-green-800"><CheckCircle2 className="h-5 w-5" />Aceite registrado com sucesso.</div>
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" disabled={isPending} onClick={() => startTransition(async () => {
        setError(null)
        const result = await registrarAceite(token)
        if (result.success) setAccepted(true)
        else setError(result.error ?? "Não foi possível registrar o aceite")
      })}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {isPending ? "Registrando..." : "Li e aceito as regras"}
      </Button>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  )
}
