"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface SalvarFotoInput {
  mala_id: string
  storage_path: string
  url: string
}

export async function salvarFoto(input: SalvarFotoInput): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { success: false, error: "Não autenticado" }

  const { error } = await supabase.from("fotos_malas").insert({
    mala_id: input.mala_id,
    storage_path: input.storage_path,
    url: input.url,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/checkin/[id]`, "page")
  return { success: true }
}

export async function excluirFoto(fotoId: string, storagePath: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { success: false, error: "Não autenticado" }

  await supabase.storage.from("fotos-malas").remove([storagePath])

  const { error } = await supabase.from("fotos_malas").delete().eq("id", fotoId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/checkin/[id]`, "page")
  return { success: true }
}
