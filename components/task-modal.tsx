"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/lib/types"

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  onSave: (taskData: Omit<Task, "id" | "createdAt">) => void
}

const categories = ["Kuliah", "Freelance", "Pribadi", "Pekerjaan", "Lainnya"]

export function TaskModal({ open, onOpenChange, task, onSave }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    dueDate: "",
    weight: 3,
    estHours: 1,
    status: "todo" as const,
    category: "Pribadi",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task) {
      // Convert ISO date to datetime-local format
      const dueDate = new Date(task.dueDate)
      const localDate = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

      setFormData({
        title: task.title,
        desc: task.desc,
        dueDate: localDate,
        weight: task.weight,
        estHours: task.estHours,
        status: task.status,
        category: task.category,
      })
    } else {
      // Reset form for new task
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(18, 0, 0, 0)
      const localDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

      setFormData({
        title: "",
        desc: "",
        dueDate: localDate,
        weight: 3,
        estHours: 1,
        status: "todo",
        category: "Pribadi",
      })
    }
    setErrors({})
  }, [task, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Judul tugas wajib diisi"
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Tanggal deadline wajib diisi"
    } else {
      const dueDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        newErrors.dueDate = "Tanggal deadline tidak boleh di masa lalu"
      }
    }

    if (formData.estHours <= 0) {
      newErrors.estHours = "Estimasi jam harus lebih dari 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Convert datetime-local back to ISO string
    const dueDate = new Date(formData.dueDate).toISOString()

    onSave({
      ...formData,
      dueDate,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Tugas" : "Tambah Tugas Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Tugas *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masukkan judul tugas"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Deskripsi</Label>
            <Textarea
              id="desc"
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Deskripsi tugas (opsional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "todo" | "in-progress" | "done") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Deadline *</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className={errors.dueDate ? "border-red-500" : ""}
            />
            {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Bobot Prioritas (1-5)</Label>
              <Select
                value={formData.weight.toString()}
                onValueChange={(value) => setFormData({ ...formData, weight: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Rendah</SelectItem>
                  <SelectItem value="2">2 - Agak Rendah</SelectItem>
                  <SelectItem value="3">3 - Sedang</SelectItem>
                  <SelectItem value="4">4 - Tinggi</SelectItem>
                  <SelectItem value="5">5 - Sangat Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estHours">Estimasi Jam</Label>
              <Input
                id="estHours"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estHours}
                onChange={(e) => setFormData({ ...formData, estHours: Number.parseFloat(e.target.value) || 1 })}
                className={errors.estHours ? "border-red-500" : ""}
              />
              {errors.estHours && <p className="text-sm text-red-500">{errors.estHours}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">{task ? "Update" : "Tambah Cepat"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
