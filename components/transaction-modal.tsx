"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction } from "@/lib/types"

interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  onSave: (transactionData: Omit<Transaction, "id">) => void
}

const incomeCategories = ["Gaji", "Freelance", "Bonus", "Investasi", "Lainnya"]
const expenseCategories = ["Makan", "Transport", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Lainnya"]
const investmentCategories = ["Saham", "Reksa Dana", "Crypto", "Emas", "Deposito", "Lainnya"]

export function TransactionModal({ open, onOpenChange, transaction, onSave }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    type: "expense" as const,
    amount: "",
    date: "",
    category: "",
    note: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        date: transaction.date,
        category: transaction.category,
        note: transaction.note,
      })
    } else {
      // Reset form for new transaction
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        type: "expense",
        amount: "",
        date: today,
        category: "",
        note: "",
      })
    }
    setErrors({})
  }, [transaction, open])

  const getCategories = () => {
    switch (formData.type) {
      case "income":
        return incomeCategories
      case "expense":
        return expenseCategories
      case "investment":
        return investmentCategories
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Jumlah harus lebih dari 0"
    }

    if (!formData.date) {
      newErrors.date = "Tanggal wajib diisi"
    }

    if (!formData.category) {
      newErrors.category = "Kategori wajib dipilih"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSave({
      type: formData.type,
      amount: Number.parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      note: formData.note,
    })

    onOpenChange(false)
  }

  const handleTypeChange = (newType: "income" | "expense" | "investment") => {
    setFormData({
      ...formData,
      type: newType,
      category: "", // Reset category when type changes
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipe Transaksi</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
                <SelectItem value="investment">Investasi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {getCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Catatan</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">{transaction ? "Update" : "Tambah"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
