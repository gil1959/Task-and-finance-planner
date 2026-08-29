"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Wallet, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"

interface FinanceSummaryProps {
  transactions: Transaction[]
  initialBalance: number
  onUpdateInitialBalance: (balance: number) => Promise<void>
}

export function FinanceSummary({ transactions, initialBalance, onUpdateInitialBalance }: FinanceSummaryProps) {
  const [isEditingBalance, setIsEditingBalance] = useState(false)
  const [tempBalance, setTempBalance] = useState(initialBalance.toString())

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

  const balance = initialBalance + totalIncome - totalExpense - totalInvestment

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

  const handleSaveBalance = async () => {
    try {
      const val = Number.parseFloat(tempBalance)
      if (!isNaN(val)) {
        await onUpdateInitialBalance(val)
      }
      setIsEditingBalance(false)
    } catch (e: any) {
      alert("Gagal menyimpan saldo awal: " + (e.message || "Unknown error"))
      setIsEditingBalance(false)
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => {
                setTempBalance(initialBalance.toString())
                setIsEditingBalance(true)
              }}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Saldo Awal + (Pemasukan - Pengeluaran - Investasi)</p>
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

      <Dialog open={isEditingBalance} onOpenChange={setIsEditingBalance}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Atur Saldo Awal</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Jumlah Saldo Awal (Rp)</label>
              <Input
                type="number"
                value={tempBalance}
                onChange={(e) => setTempBalance(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingBalance(false)}>Batal</Button>
            <Button onClick={handleSaveBalance}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
