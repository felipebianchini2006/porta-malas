"use client"

import { useState } from "react"
import Image from "next/image"
import { FotoUpload } from "./foto-upload"
import type { Mala, FotoMala } from "@/lib/types"

interface SecaoFotosProps {
  malas: (Mala & { fotos: FotoMala[] })[]
  atendimentoId: string
}

export function SecaoFotos({ malas, atendimentoId }: SecaoFotosProps) {
  const [fotasPorMala, setFotosPorMala] = useState<Record<string, FotoMala[]>>(
    Object.fromEntries(malas.map((m) => [m.id, m.fotos]))
  )

  function handleUploadComplete(malaId: string, url: string) {
    setFotosPorMala((prev) => ({
      ...prev,
      [malaId]: [
        ...(prev[malaId] ?? []),
        { id: crypto.randomUUID(), mala_id: malaId, storage_path: "", url, created_at: new Date().toISOString() },
      ],
    }))
  }

  return (
    <div className="space-y-5">
      {malas.map((mala) => {
        const fotos = fotasPorMala[mala.id] ?? []
        return (
          <div key={mala.id} className="space-y-3">
            <p className="text-sm font-medium text-slate-700">
              Mala{" "}
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                {mala.identificacao_interna}
              </span>
              {mala.descricao && (
                <span className="text-muted-foreground font-normal ml-2">— {mala.descricao}</span>
              )}
            </p>

            {fotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {fotos.map((foto) => (
                  <div key={foto.id} className="relative aspect-square overflow-hidden rounded-md border bg-slate-100">
                    <Image
                      src={foto.url}
                      alt={`Foto mala ${mala.identificacao_interna}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            )}

            <FotoUpload
              malaId={mala.id}
              atendimentoId={atendimentoId}
              onUploadComplete={(url) => handleUploadComplete(mala.id, url)}
            />
          </div>
        )
      })}
    </div>
  )
}
