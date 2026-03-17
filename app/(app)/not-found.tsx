import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-2xl font-bold">404 — Página não encontrada</h2>
      <p className="text-muted-foreground">A página que você procura não existe.</p>
      <Button asChild>
        <Link href="/dashboard">
          <Home className="mr-2 h-4 w-4" />
          Voltar ao Painel
        </Link>
      </Button>
    </div>
  )
}
