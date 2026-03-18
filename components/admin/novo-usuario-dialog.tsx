"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { criarUsuario } from "@/lib/actions/usuarios"
import { UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function NovoUsuarioDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [role, setRole] = useState<"admin" | "operador">("operador")
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) {
      setNome("")
      setEmail("")
      setSenha("")
      setRole("operador")
      setError(null)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await criarUsuario(nome, email, senha, role)
      if (result.error) {
        setError(result.error)
        return
      }
      toast.success("Usuário criado com sucesso!")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar novo usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="novo-nome">Nome completo</Label>
            <Input
              id="novo-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria Operadora"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="novo-email">E-mail</Label>
            <Input
              id="novo-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@bagpoint.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="novo-senha">Senha</Label>
            <Input
              id="novo-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="novo-role">Papel</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "operador")}>
              <SelectTrigger id="novo-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operador">Operador</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar usuário"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
