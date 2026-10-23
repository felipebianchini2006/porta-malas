"use client"

import { useEffect, useState } from "react"
import { Loader2, Share2, MessageCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { mensagemCompartilhamentoFotos, nomeArquivoFoto } from "@/lib/utils/photo-share"

interface FotoCompartilhavel {
  url: string
  lacre: string
  index: number
}

interface CompartilharFotosProps {
  fotos: FotoCompartilhavel[]
  clienteNome: string
  protocolo: string
  whatsappLink: string
}

async function carregarImagem(blob: Blob): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(blob)
  const image = new Image()
  image.src = objectUrl
  try {
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function gerarFotoCompartilhavel(foto: FotoCompartilhavel): Promise<File> {
  const response = await fetch(foto.url, { credentials: "same-origin" })
  if (!response.ok) throw new Error("Não foi possível carregar uma das fotos")

  const image = await carregarImagem(await response.blob())
  const maxDimension = 1600
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) throw new Error("Este navegador não conseguiu preparar as fotos")
  context.drawImage(image, 0, 0, width, height)

  const fontSize = Math.max(24, Math.round(width * 0.045))
  const overlayHeight = Math.max(64, Math.round(fontSize * 2.2))
  context.fillStyle = "rgba(15, 23, 42, 0.82)"
  context.fillRect(0, height - overlayHeight, width, overlayHeight)
  context.fillStyle = "#ffffff"
  context.font = `700 ${fontSize}px sans-serif`
  context.textBaseline = "middle"
  context.fillText(`Lacre: ${foto.lacre}`, Math.round(fontSize * 0.8), height - overlayHeight / 2)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("Não foi possível gerar a foto")),
      "image/jpeg",
      0.76
    )
  })

  return new File([blob], nomeArquivoFoto(foto.lacre, foto.index), { type: "image/jpeg" })
}

function baixarArquivos(files: File[]) {
  for (const file of files) {
    const url = URL.createObjectURL(file)
    const link = document.createElement("a")
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }
}

export function CompartilharFotos({
  fotos,
  clienteNome,
  protocolo,
  whatsappLink,
}: CompartilharFotosProps) {
  const [enviando, setEnviando] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const [erro, setErro] = useState<string | null>(null)
  const [preparadas, setPreparadas] = useState<{
    key: string
    arquivos: { file: File; url: string; lacre: string }[]
  } | null>(null)
  const fotosKey = JSON.stringify(fotos)
  const arquivos = preparadas?.key === fotosKey ? preparadas.arquivos : null
  const preparando = !arquivos && !erro

  useEffect(() => {
    let cancelado = false
    const urls: string[] = []
    setPreparadas(null)
    setErro(null)
    const atuais: FotoCompartilhavel[] = JSON.parse(fotosKey)

    Promise.all(atuais.map(gerarFotoCompartilhavel)).then((files) => {
      if (cancelado) return
      const arquivos = files.map((file, index) => {
        const url = URL.createObjectURL(file)
        urls.push(url)
        return { file, url, lacre: atuais[index].lacre }
      })
      setPreparadas({ key: fotosKey, arquivos })
    }).catch((error: unknown) => {
      if (!cancelado) setErro(error instanceof Error ? error.message : "Não foi possível preparar as fotos")
    })

    return () => {
      cancelado = true
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [fotosKey, tentativa])

  async function compartilhar() {
    if (!arquivos || enviando) return
    setEnviando(true)
    try {
      const files = arquivos.map(({ file }) => file)
      const text = mensagemCompartilhamentoFotos(
        clienteNome,
        protocolo,
        fotos.map((foto) => foto.lacre)
      )
      const shareData: ShareData = { title: `Fotos ${protocolo}`, text, files }

      // Arquivos já preparados: a chamada nativa acontece no próprio clique.
      if (navigator.share && navigator.canShare?.({ files })) {
        await navigator.share(shareData)
        toast.success("Fotos abertas para compartilhamento")
        return
      }

      baixarArquivos(files)
      toast.info("Fotos baixadas. Toque em Abrir conversa no WhatsApp e anexe os arquivos.")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      toast.error("O navegador não abriu o compartilhamento. Baixe as fotos abaixo e anexe na conversa do WhatsApp.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-green-900">Enviar fotos ao cliente</p>
          <p className="mt-0.5 text-xs text-green-700">
            As cópias são leves e levam o número do lacre gravado na imagem.
          </p>
        </div>
        <Button
          type="button"
          onClick={compartilhar}
          disabled={preparando || enviando || !!erro || fotos.length === 0}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          {preparando || enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          {preparando ? "Preparando fotos..." : enviando ? "Compartilhando..." : "Compartilhar agora"}
        </Button>
      </div>
      {erro && (
        <div className="mt-3 space-y-2" role="alert">
          <p className="text-sm text-red-700">{erro}</p>
          <Button type="button" variant="outline" onClick={() => setTentativa((value) => value + 1)}>
            Tentar preparar novamente
          </Button>
        </div>
      )}
      {arquivos && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-green-800">
            Se o compartilhamento não abrir, baixe as fotos e anexe na conversa do WhatsApp.
          </p>
          <div className="flex flex-col gap-2">
            {arquivos.map(({ file, url, lacre }, index) => (
              <a key={`${file.name}:${index}`} href={url} download={file.name} className="break-words text-sm text-green-900 underline">
                Baixar foto {index + 1} — lacre {lacre}
              </a>
            ))}
          </div>
        </div>
      )}
      <Button asChild variant="outline" className="mt-3 w-full sm:w-auto">
        <a href={whatsappLink} rel="noreferrer">
          <MessageCircle className="h-4 w-4" />
          Abrir conversa no WhatsApp
        </a>
      </Button>
    </div>
  )
}
