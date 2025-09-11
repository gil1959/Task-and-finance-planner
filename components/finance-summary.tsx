"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Wallet } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface FinanceSummaryProps {
  transactions: Transaction[]
}

export function FinanceSummary({ transactions }: FinanceSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate totals
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const totalInvestment = transactions.filter((t) => t.type === "investment").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense - totalInvestment

  // Calculate this month's totals
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date)
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
  })

  const thisMonthIncome = thisMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const thisMonthExpense = thisMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const thisMonthInvestment = thisMonthTransactions
    .filter((t) => t.type === "investment")
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">Total pemasukan - pengeluaran</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(thisMonthIncome)}</div>
          <p className="text-xs text-muted-foreground">Total: {formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pengeluaran Bulan Ini</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(thisMonthExpense)}</div>
          <p className="text-xs text-muted-foreground">Total: {formatCurrency(totalExpense)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investasi Bulan Ini</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(thisMonthInvestment)}</div>
          <p className="text-xs text-muted-foreground">Total: {formatCurrency(totalInvestment)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
