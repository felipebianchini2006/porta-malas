"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Algo deu errado</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Ocorreu um erro inesperado. Por favor, tente novamente.
      </p>
      <Button onClick={reset}>Tentar Novamente</Button>
    </div>
  )
}
