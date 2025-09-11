"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Clock, AlertTriangle, Wallet } from "lucide-react"
import type { Task, Transaction } from "@/lib/types"

interface KPIBarProps {
  tasks: Task[]
  transactions: Transaction[]
}

export function KPIBar({ tasks, transactions }: KPIBarProps) {
  const formatCurrency = (amount: number) => {
    if (window.innerWidth < 640) {
      // Shorter format for mobile
      if (amount >= 1000000) {
        return `Rp ${(amount / 1000000).toFixed(1)}M`
      }
      if (amount >= 1000) {
        return `Rp ${(amount / 1000).toFixed(0)}K`
      }
      return `Rp ${amount.toLocaleString("id-ID")}`
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate task metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tasksToday = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    return dueDate >= today && dueDate < tomorrow && task.status !== "done"
  }).length

  const overdueTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    return dueDate < today && task.status !== "done"
  }).length

  // Calculate financial metrics
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const totalInvestment = transactions.filter((t) => t.type === "investment").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense - totalInvestment

  // Calculate this month's income
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonthIncome = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        t.type === "income" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Tugas Hari Ini</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{tasksToday}</div>
          <p className="text-xs text-muted-foreground">Deadline hari ini</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Terlambat</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-xl sm:text-2xl font-bold ${overdueTasks > 0 ? "text-red-600" : ""}`}>
            {overdueTasks}
          </div>
          <p className="text-xs text-muted-foreground">Perlu perhatian</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-lg sm:text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">Total saldo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Bulan Ini</CardTitle>
          <Clock className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(thisMonthIncome)}</div>
          <p className="text-xs text-muted-foreground">Pemasukan</p>
        </CardContent>
      </Card>
    </div>
  )
}
