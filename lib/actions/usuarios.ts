"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export interface UsuarioComEmail {
  id: string
  nome: string
  email: string | null
  role: "admin" | "operador"
  ativo: boolean
  created_at: string
}

export async function criarUsuario(
  nome: string,
  email: string,
  senha: string,
  role: "admin" | "operador"
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Não autenticado" }

  const { data: currentUser } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user.id)
    .single()

  if (currentUser?.role !== "admin") return { error: "Sem permissão" }

  const adminClient = createAdminClient()
  const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError || !newUser.user) {
    return { error: authError?.message ?? "Erro ao criar usuário" }
  }

  const { error: dbError } = await supabase.from("usuarios").upsert({
    id: newUser.user.id,
    nome,
    email,
    role,
    ativo: true,
  })

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath("/admin/usuarios")
  return { success: true }
}

export async function listarUsuarios(): Promise<UsuarioComEmail[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Erro ao listar usuários:", error)
    return []
  }

  return (data ?? []) as UsuarioComEmail[]
}

export async function atualizarRole(
  userId: string,
  role: "admin" | "operador"
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Prevent admin from changing their own role
  if (user.id === userId) {
    return { error: "Você não pode alterar seu próprio papel" }
  }

  const { data: currentUser } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user.id)
    .single()

  if (currentUser?.role !== "admin") {
    return { error: "Sem permissão" }
  }

  const { error } = await supabase
    .from("usuarios")
    .update({ role })
    .eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/usuarios")
  return { success: true }
}

export async function toggleAtivo(
  userId: string,
  ativo: boolean
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Prevent admin from deactivating themselves
  if (user.id === userId) {
    return { error: "Você não pode desativar sua própria conta" }
  }

  const { data: currentUser } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user.id)
    .single()

  if (currentUser?.role !== "admin") {
    return { error: "Sem permissão" }
  }

  const { error } = await supabase
    .from("usuarios")
    .update({ ativo })
    .eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/usuarios")
  return { success: true }
}
