"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, MoreVertical, Pencil, Trash2 } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TransactionCardProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const getTypeIcon = () => {
    switch (transaction.type) {
      case "income":
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />
      case "expense":
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />
      case "investment":
        return <TrendingUp className="h-5 w-5 text-blue-500" />
    }
  }

  const getTypeLabel = () => {
    switch (transaction.type) {
      case "income":
        return "Pemasukan"
      case "expense":
        return "Pengeluaran"
      case "investment":
        return "Investasi"
    }
  }

  const getTypeColor = () => {
    switch (transaction.type) {
      case "income":
        return "text-green-600"
      case "expense":
        return "text-red-600"
      case "investment":
        return "text-blue-600"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: window.innerWidth < 640 ? undefined : "numeric",
    })
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">{getTypeIcon()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel()}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {transaction.category}
                </Badge>
              </div>
              {transaction.note && (
                <p className="text-xs sm:text-sm text-muted-foreground text-pretty line-clamp-2">{transaction.note}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="text-right">
              <p className={cn("font-semibold text-sm sm:text-base", getTypeColor())}>
                {transaction.type === "expense" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(transaction)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
