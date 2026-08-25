"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { login } from "@/lib/actions/auth"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function LoginForm() {
  const searchParams = useSearchParams()
  const contaDesativada = searchParams.get("motivo") === "conta-desativada"

  const [error, setError] = useState<string | null>(
    contaDesativada ? "Sua conta foi desativada. Contate o administrador." : null
  )
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader className="items-center text-center space-y-3">
        <Image
          src="/logo-bagpoint.jpeg"
          alt="Bag Point"
          width={120}
          height={120}
          className="rounded-xl"
          priority
        />
        <CardDescription>Acesse sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="rounded-md"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="rounded-md"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
