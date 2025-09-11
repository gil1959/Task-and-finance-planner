"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, CheckSquare, DollarSign } from "lucide-react"
import type { Task, Transaction } from "@/lib/types"

interface QuickAddProps {
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void
}

export function QuickAdd({ onAddTask, onAddTransaction }: QuickAddProps) {
  const [activeTab, setActiveTab] = useState<"task" | "transaction">("task")

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    weight: 3,
    estHours: 1,
  })

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    type: "expense" as const,
    amount: "",
    category: "",
  })

  const handleAddTask = () => {
    if (!taskForm.title.trim()) return

    // Set deadline to tomorrow 6 PM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(18, 0, 0, 0)

    onAddTask({
      title: taskForm.title,
      desc: "",
      dueDate: tomorrow.toISOString(),
      weight: taskForm.weight,
      estHours: taskForm.estHours,
      status: "todo",
      category: "Pribadi",
    })

    // Reset form
    setTaskForm({
      title: "",
      weight: 3,
      estHours: 1,
    })
  }

  const handleAddTransaction = () => {
    if (!transactionForm.amount || !transactionForm.category) return

    const today = new Date().toISOString().split("T")[0]

    onAddTransaction({
      type: transactionForm.type,
      amount: Number.parseFloat(transactionForm.amount),
      date: today,
      category: transactionForm.category,
      note: "",
    })

    // Reset form
    setTransactionForm({
      type: "expense",
      amount: "",
      category: "",
    })
  }

  const getTransactionCategories = () => {
    switch (transactionForm.type) {
      case "income":
        return ["Gaji", "Freelance", "Bonus", "Lainnya"]
      case "expense":
        return ["Makan", "Transport", "Belanja", "Tagihan", "Lainnya"]
      case "investment":
        return ["Saham", "Reksa Dana", "Crypto", "Lainnya"]
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "task" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("task")}
            className="flex-1"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Tugas
          </Button>
          <Button
            variant={activeTab === "transaction" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("transaction")}
            className="flex-1"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Transaksi
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeTab === "task" ? (
          <>
            <Input
              placeholder="Judul tugas..."
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />

            <div className="grid grid-cols-2 gap-2">
              <Select
                value={taskForm.weight.toString()}
                onValueChange={(value) => setTaskForm({ ...taskForm, weight: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Prioritas 1</SelectItem>
                  <SelectItem value="2">Prioritas 2</SelectItem>
                  <SelectItem value="3">Prioritas 3</SelectItem>
                  <SelectItem value="4">Prioritas 4</SelectItem>
                  <SelectItem value="5">Prioritas 5</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Jam"
                min="0.5"
                step="0.5"
                value={taskForm.estHours}
                onChange={(e) => setTaskForm({ ...taskForm, estHours: Number.parseFloat(e.target.value) || 1 })}
              />
            </div>

            <Button onClick={handleAddTask} className="w-full" disabled={!taskForm.title.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Cepat
            </Button>
          </>
        ) : (
          <>
            <Select
              value={transactionForm.type}
              onValueChange={(value: "income" | "expense" | "investment") =>
                setTransactionForm({ ...transactionForm, type: value, category: "" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
                <SelectItem value="investment">Investasi</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Jumlah (Rp)"
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
            />

            <Select
              value={transactionForm.category}
              onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {getTransactionCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAddTransaction}
              className="w-full"
              disabled={!transactionForm.amount || !transactionForm.category}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
