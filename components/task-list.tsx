"use client"

import { useMemo } from "react"
import { TaskCard } from "./task-card"
import { sortTasksByPriority } from "@/lib/score"
import type { Task } from "@/lib/types"

interface FilterState {
  search: string
  category: string
  status: string
  dueDateRange: string
  minScore: string
}

interface TaskListProps {
  tasks: Task[]
  filters: FilterState
  onToggleStatus: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, filters, onToggleStatus, onEdit, onDelete }: TaskListProps) {
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.desc.toLowerCase().includes(searchLower) ||
          task.category.toLowerCase().includes(searchLower),
      )
    }

    // Apply category filter
    if (filters.category && filters.category !== "Semua") {
      filtered = filtered.filter((task) => task.category === filters.category)
    }

    // Apply status filter
    if (filters.status && filters.status !== "Semua") {
      filtered = filtered.filter((task) => task.status === filters.status)
    }

    // Apply due date range filter
    if (filters.dueDateRange && filters.dueDateRange !== "Semua") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() + 7)

      filtered = filtered.filter((task) => {
        const dueDate = new Date(task.dueDate)

        switch (filters.dueDateRange) {
          case "today":
            return dueDate >= today && dueDate < tomorrow
          case "tomorrow":
            const nextDay = new Date(tomorrow)
            nextDay.setDate(nextDay.getDate() + 1)
            return dueDate >= tomorrow && dueDate < nextDay
          case "this-week":
            return dueDate >= today && dueDate < weekEnd
          case "overdue":
            return dueDate < today && task.status !== "done"
          default:
            return true
        }
      })
    }

    // Apply minimum score filter
    if (filters.minScore) {
      const minScore = Number.parseInt(filters.minScore)
      if (!isNaN(minScore)) {
        filtered = filtered.filter((task) => {
          const score = require("@/lib/score").calculateTaskScore(task)
          return score >= minScore
        })
      }
    }

    // Sort by priority
    return sortTasksByPriority(filtered)
  }, [tasks, filters])

  if (filteredAndSortedTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium mb-2">
          {tasks.length === 0
            ? "Nih sepi. Tambah tugas baru biar hidup terasa produktif."
            : "Tidak ada tugas yang cocok dengan filter"}
        </h3>
        <p className="text-muted-foreground">
          {tasks.length === 0
            ? "Mulai dengan menambahkan tugas pertama Anda"
            : "Coba ubah filter atau tambah tugas baru"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredAndSortedTasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggleStatus={onToggleStatus} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
