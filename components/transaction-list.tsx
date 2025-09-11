"use client"

import { useMemo } from "react"
import { TransactionCard } from "./transaction-card"
import type { Transaction } from "@/lib/types"

interface FilterState {
  search: string
  type: string
  category: string
  dateRange: string
}

interface TransactionListProps {
  transactions: Transaction[]
  filters: FilterState
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, filters, onEdit, onDelete }: TransactionListProps) {
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (transaction) =>
          transaction.category.toLowerCase().includes(searchLower) ||
          transaction.note.toLowerCase().includes(searchLower),
      )
    }

    // Apply type filter
    if (filters.type && filters.type !== "Semua") {
      filtered = filtered.filter((transaction) => transaction.type === filters.type)
    }

    // Apply category filter
    if (filters.category && filters.category !== "Semua") {
      filtered = filtered.filter((transaction) => transaction.category === filters.category)
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== "Semua") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)

        switch (filters.dateRange) {
          case "today":
            return transactionDate >= today
          case "this-month":
            return transactionDate >= thisMonth
          case "last-month":
            return transactionDate >= lastMonth && transactionDate <= lastMonthEnd
          default:
            return true
        }
      })
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, filters])

  if (filteredAndSortedTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-lg font-medium mb-2">
          {transactions.length === 0 ? "Belum ada transaksi" : "Tidak ada transaksi yang cocok dengan filter"}
        </h3>
        <p className="text-muted-foreground">
          {transactions.length === 0
            ? "Mulai dengan menambahkan transaksi pertama Anda"
            : "Coba ubah filter atau tambah transaksi baru"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredAndSortedTransactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
