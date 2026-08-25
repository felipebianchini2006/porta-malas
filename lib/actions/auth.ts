"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { query } from "@/lib/db"
import { ensureBootstrapAdmin } from "@/lib/auth/bootstrap"
import { verifyPassword } from "@/lib/auth/password"
import { createSession, destroySession } from "@/lib/auth/session"

export async function login(formData: FormData) {
  await ensureBootstrapAdmin()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const result = await query<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM usuarios WHERE email = $1 AND ativo = true",
    [email]
  )
  const user = result.rows[0]
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: "E-mail ou senha inválidos" }
  }

  await createSession(user.id)

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function logout() {
  await destroySession()
  revalidatePath("/", "layout")
  redirect("/login")
}
