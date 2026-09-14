"use client"

import { useEffect, useState } from "react"
import { Clipboard, Download, Link2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Parceiro } from "@/lib/types"
import { criarLinkIndicacao } from "@/lib/utils/partner-referral"

interface ParceiroQrDialogProps {
  parceiro: Pick<Parceiro, "nome" | "codigo_indicacao"> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function nomeArquivo(codigo: string): string {
  return `qr-parceiro-${codigo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`
}

export function ParceiroQrDialog({ parceiro, open, onOpenChange }: ParceiroQrDialogProps) {
  const [dataUrl, setDataUrl] = useState("")
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !parceiro) return
    let active = true
    const referralLink = criarLinkIndicacao(window.location.origin, parceiro.codigo_indicacao)
    setLink(referralLink)
    setDataUrl("")
    setLoading(true)

    void import("qrcode")
      .then(({ toDataURL }) => toDataURL(referralLink, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#0f172a", light: "#ffffff" },
      }))
      .then((result) => {
        if (active) setDataUrl(result)
      })
      .catch(() => {
        if (active) toast.error("Não foi possível gerar o QR Code.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [open, parceiro])

  async function copiarQr() {
    if (!dataUrl) return
    try {
      const blob = await fetch(dataUrl).then((response) => response.blob())
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) throw new Error("IMAGE_CLIPBOARD_UNAVAILABLE")
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      toast.success("QR Code copiado como imagem.")
    } catch {
      await copiarLink("O navegador não permitiu copiar a imagem. Link copiado.")
    }
  }

  async function copiarLink(message = "Link de indicação copiado.") {
    try {
      await navigator.clipboard.writeText(link)
      toast.success(message)
    } catch {
      toast.error("Não foi possível copiar. Use o botão de download.")
    }
  }

  if (!parceiro) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code de {parceiro.nome}</DialogTitle>
          <DialogDescription>
            Envie este QR ao parceiro. No check-in, a leitura seleciona automaticamente a indicação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="mx-auto flex aspect-square w-full max-w-72 items-center justify-center rounded-xl border bg-white p-3">
            {loading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt={`QR Code de indicação de ${parceiro.nome}`} className="h-full w-full" />
            ) : <p className="text-sm text-muted-foreground">QR Code indisponível.</p>}
          </div>

          <div className="rounded-md bg-slate-50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Código de indicação</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold">{parceiro.codigo_indicacao}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Button type="button" onClick={copiarQr} disabled={!dataUrl}>
              <Clipboard />Copiar QR
            </Button>
            <Button type="button" variant="outline" onClick={() => copiarLink()} disabled={!link}>
              <Link2 />Copiar link
            </Button>
            <Button type="button" variant="outline" asChild={Boolean(dataUrl)} disabled={!dataUrl}>
              {dataUrl ? <a href={dataUrl} download={nomeArquivo(parceiro.codigo_indicacao)}><Download />Baixar PNG</a> : <span><Download />Baixar PNG</span>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
