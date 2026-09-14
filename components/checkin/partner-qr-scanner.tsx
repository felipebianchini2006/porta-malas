"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, ImageUp, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Parceiro } from "@/lib/types"
import { encontrarParceiroAtivoPorCodigo } from "@/lib/utils/partner-referral"

interface PartnerQrScannerProps {
  parceiros: Parceiro[]
  onParceiroEncontrado: (id: string) => void
}

export function PartnerQrScanner({ parceiros, onParceiroEncontrado }: PartnerQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<{ destroy: () => void } | null>(null)
  const resolvedRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState("")

  function resolver(payload: string): boolean {
    const parceiro = encontrarParceiroAtivoPorCodigo(parceiros, payload)
    if (!parceiro) {
      setError("QR Code inválido ou parceiro não está ativo.")
      return false
    }
    if (resolvedRef.current) return true
    resolvedRef.current = true
    onParceiroEncontrado(parceiro.id)
    toast.success(`Parceiro identificado: ${parceiro.nome}`)
    setOpen(false)
    return true
  }

  useEffect(() => {
    if (!open || !videoRef.current) return
    let active = true
    resolvedRef.current = false
    setError("")
    setStarting(true)

    void import("qr-scanner").then(async ({ default: QrScanner }) => {
      if (!active || !videoRef.current) return
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (resolver(result.data)) scanner.destroy()
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          maxScansPerSecond: 8,
        }
      )
      scannerRef.current = scanner
      await scanner.start()
    }).catch(() => {
      if (active) setError("Não foi possível acessar a câmera. Autorize o acesso ou escolha uma imagem do QR Code.")
    }).finally(() => {
      if (active) setStarting(false)
    })

    return () => {
      active = false
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
  // A lista de parceiros é estável durante este formulário.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function lerImagem(file: File | undefined) {
    if (!file) return
    setError("")
    setStarting(true)
    try {
      const { default: QrScanner } = await import("qr-scanner")
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
      resolver(result.data)
    } catch {
      setError("Não foi possível encontrar um QR Code válido nesta imagem.")
    } finally {
      setStarting(false)
    }
  }

  return (
    <>
      <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)} disabled={parceiros.length === 0}>
        <Camera />Ler QR Code do parceiro
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ler QR Code do parceiro</DialogTitle>
            <DialogDescription>Aponte a câmera para o QR enviado ao hóspede ou escolha uma imagem salva.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-950">
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
              {starting && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}
            </div>

            {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
              <ImageUp className="h-4 w-4" />
              Ler imagem do QR Code
              <Input className="sr-only" type="file" accept="image/*" onChange={(event) => { void lerImagem(event.target.files?.[0]); event.target.value = "" }} />
            </label>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
