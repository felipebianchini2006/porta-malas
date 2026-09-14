"use client"

import { useRef, useState } from "react"
import { Camera, ImageUp, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Parceiro } from "@/lib/types"
import {
  encontrarParceiroAtivoPorCodigo,
  obterAtributosCapturaQr,
} from "@/lib/utils/partner-referral"

interface PartnerQrScannerProps {
  parceiros: Parceiro[]
  onParceiroEncontrado: (id: string) => void
}

export function PartnerQrScanner({ parceiros, onParceiroEncontrado }: PartnerQrScannerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState("")

  function resolver(payload: string): boolean {
    const parceiro = encontrarParceiroAtivoPorCodigo(parceiros, payload)
    if (!parceiro) {
      const message = "QR Code inválido ou parceiro não está ativo."
      setError(message)
      toast.error(message)
      return false
    }
    onParceiroEncontrado(parceiro.id)
    toast.success(`Parceiro identificado: ${parceiro.nome}`)
    return true
  }

  async function lerImagem(file: File | undefined) {
    if (!file) return
    setError("")
    setReading(true)
    try {
      const { default: QrScanner } = await import("qr-scanner")
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
      resolver(result.data)
    } catch {
      const message = "Não foi possível encontrar um QR Code válido nesta imagem."
      setError(message)
      toast.error(message)
    } finally {
      setReading(false)
    }
  }

  const disabled = parceiros.length === 0 || reading

  return (
    <div className="space-y-2">
      <Input
        ref={cameraInputRef}
        className="sr-only"
        type="file"
        {...obterAtributosCapturaQr("camera")}
        onChange={(event) => {
          void lerImagem(event.target.files?.[0])
          event.target.value = ""
        }}
      />
      <Input
        ref={galleryInputRef}
        className="sr-only"
        type="file"
        {...obterAtributosCapturaQr("galeria")}
        onChange={(event) => {
          void lerImagem(event.target.files?.[0])
          event.target.value = ""
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => cameraInputRef.current?.click()}
        disabled={disabled}
      >
        {reading ? <Loader2 className="animate-spin" /> : <Camera />}
        {reading ? "Lendo QR Code..." : "Abrir câmera e ler QR Code"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => galleryInputRef.current?.click()}
        disabled={disabled}
      >
        <ImageUp />Escolher imagem da galeria
      </Button>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
