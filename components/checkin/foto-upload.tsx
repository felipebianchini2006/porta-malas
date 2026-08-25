"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FotoUploadProps {
  malaId: string
  atendimentoId: string
  onUploadComplete?: (url: string) => void
}

interface Preview {
  file: File
  objectUrl: string
}

export function FotoUpload({ malaId, atendimentoId, onUploadComplete }: FotoUploadProps) {
  const [previews, setPreviews] = useState<Preview[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const novos: Preview[] = files.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
    }))
    setPreviews((prev) => [...prev, ...novos])

    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = ""
  }

  function removerPreview(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].objectUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function uploadFotos() {
    if (previews.length === 0) return
    setUploading(true)
    let uploadedCount = 0

    try {
      for (const preview of previews) {
        const formData = new FormData()
        formData.set("file", preview.file)
        formData.set("malaId", malaId)
        formData.set("atendimentoId", atendimentoId)

        try {
          const response = await fetch("/api/uploads", { method: "POST", body: formData })
          const result = (await response.json()) as { url?: string; error?: string }

          if (!response.ok || !result.url) {
            toast.error(`Erro ao enviar foto: ${result.error || "falha inesperada"}`)
            continue
          }

          uploadedCount += 1
          onUploadComplete?.(result.url)
        } catch {
          toast.error("Erro ao enviar foto: conexão indisponível")
        }
      }
    } finally {
      previews.forEach((preview) => URL.revokeObjectURL(preview.objectUrl))
      setPreviews([])
      setUploading(false)
    }

    if (uploadedCount > 0) {
      toast.success(`${uploadedCount} foto${uploadedCount > 1 ? "s" : ""} enviada${uploadedCount > 1 ? "s" : ""} com sucesso!`)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Selecionar Fotos
        </Button>

        {previews.length > 0 && (
          <Button
            type="button"
            onClick={uploadFotos}
            disabled={uploading}
            size="sm"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              `Enviar ${previews.length} foto${previews.length > 1 ? "s" : ""}`
            )}
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.objectUrl}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => removerPreview(index)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
