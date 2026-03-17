"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type FilterFn,
} from "@tanstack/react-table"
import Link from "next/link"
import { PackageCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Atendimento, Mala } from "@/lib/types"

interface AtendimentoComMalas extends Atendimento {
  malas: Mala[]
}

interface TabelaBagagensProps {
  atendimentos: AtendimentoComMalas[]
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatTempo(dataCheckin: string): string {
  const checkin = new Date(dataCheckin)
  const now = new Date()
  const diffMs = now.getTime() - checkin.getTime()
  const totalMinutes = Math.floor(diffMs / 1000 / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

const columnHelper = createColumnHelper<AtendimentoComMalas>()

const globalFilterFn: FilterFn<AtendimentoComMalas> = (row, _columnId, filterValue: string) => {
  const search = filterValue.toLowerCase()
  return (
    row.original.cliente_nome.toLowerCase().includes(search) ||
    row.original.protocolo.toLowerCase().includes(search)
  )
}

export function TabelaBagagens({ atendimentos }: TabelaBagagensProps) {
  const [globalFilter, setGlobalFilter] = useState("")

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(
    () => [
      columnHelper.accessor("protocolo", {
        header: "Protocolo",
        cell: (info) => (
          <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-transparent">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("cliente_nome", {
        header: "Cliente",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("cliente_telefone", {
        header: "Telefone",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.accessor("malas", {
        header: "Qtd. Malas",
        cell: (info) => (
          <span className="text-center block">{info.getValue()?.length ?? 0}</span>
        ),
      }),
      columnHelper.accessor("data_checkin", {
        header: "Data Check-in",
        cell: (info) => dateFormatter.format(new Date(info.getValue())),
      }),
      columnHelper.display({
        id: "tempo",
        header: "Tempo",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatTempo(row.original.data_checkin)}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue()
          return status === "ativo" ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-transparent">
              Ativo
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-transparent">
              Retirado
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: "acoes",
        header: "Ações",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/retirada?protocolo=${row.original.protocolo}`}>
              <PackageCheck className="mr-1 h-3.5 w-3.5" />
              Retirada
            </Link>
          </Button>
        ),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: atendimentos,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nome ou protocolo..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                Nenhum atendimento ativo encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
