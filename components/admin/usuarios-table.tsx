"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { atualizarRole, toggleAtivo } from "@/lib/actions/usuarios"
import type { UsuarioComEmail } from "@/lib/actions/usuarios"

interface UsuariosTableProps {
  usuarios: UsuarioComEmail[]
  currentUserId: string
}

function AvatarInitials({ nome }: { nome: string }) {
  const initials = nome.slice(0, 2).toUpperCase()
  return (
    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-medium flex-shrink-0">
      {initials}
    </div>
  )
}

function RoleSelect({
  userId,
  currentRole,
  isCurrentUser,
}: {
  userId: string
  currentRole: "admin" | "operador"
  isCurrentUser: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as "admin" | "operador"
    startTransition(async () => {
      const result = await atualizarRole(userId, newRole)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Papel atualizado com sucesso")
      }
    })
  }

  if (isCurrentUser) {
    return (
      <span
        title="Você não pode alterar seu próprio papel"
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          currentRole === "admin"
            ? "bg-violet-100 text-violet-700"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {currentRole === "admin" ? "Admin" : "Operador"}
      </span>
    )
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="operador">Operador</option>
      <option value="admin">Admin</option>
    </select>
  )
}

function ToggleAtivoButton({
  userId,
  ativo,
  isCurrentUser,
}: {
  userId: string
  ativo: boolean
  isCurrentUser: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleAtivo(userId, !ativo)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(ativo ? "Usuário desativado" : "Usuário ativado")
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        className={`border-0 ${
          ativo
            ? "bg-green-100 text-green-700 hover:bg-green-100"
            : "bg-red-100 text-red-700 hover:bg-red-100"
        }`}
      >
        {ativo ? "Ativo" : "Inativo"}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isPending || isCurrentUser}
        title={isCurrentUser ? "Você não pode desativar sua própria conta" : undefined}
        className="text-xs h-7 px-2 text-slate-500 hover:text-slate-900"
      >
        {isPending ? "..." : ativo ? "Desativar" : "Ativar"}
      </Button>
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function UsuariosTable({ usuarios, currentUserId }: UsuariosTableProps) {
  if (usuarios.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Nenhum usuário encontrado.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-4 py-3 font-medium text-slate-600">Usuário</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Papel</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Desde</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario, idx) => {
            const isCurrentUser = usuario.id === currentUserId
            return (
              <tr
                key={usuario.id}
                className={`${idx !== usuarios.length - 1 ? "border-b border-slate-100" : ""} hover:bg-slate-50 transition-colors`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <AvatarInitials nome={usuario.nome} />
                    <div>
                      <div className="font-medium text-slate-900">
                        {usuario.nome}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-slate-400">(você)</span>
                        )}
                      </div>
                      {usuario.email && (
                        <div className="text-xs text-slate-500">{usuario.email}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleSelect
                    userId={usuario.id}
                    currentRole={usuario.role}
                    isCurrentUser={isCurrentUser}
                  />
                </td>
                <td className="px-4 py-3">
                  <ToggleAtivoButton
                    userId={usuario.id}
                    ativo={usuario.ativo}
                    isCurrentUser={isCurrentUser}
                  />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatDate(usuario.created_at)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
