"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Clock, ArrowRight } from "lucide-react"
import { sortTasksByPriority, calculateTaskScore } from "@/lib/score"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PriorityTasksProps {
  tasks: Task[]
  onToggleStatus: (id: string) => void
}

export function PriorityTasks({ tasks, onToggleStatus }: PriorityTasksProps) {
  // Get top 3 priority tasks that are not done
  const activeTasks = tasks.filter((task) => task.status !== "done")
  const topTasks = sortTasksByPriority(activeTasks).slice(0, 3)

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-red-500"
    if (score >= 60) return "bg-orange-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date < today) {
      return { text: "Terlambat", color: "text-red-600" }
    }

    if (date.toDateString() === today.toDateString()) {
      return { text: "Hari ini", color: "text-orange-600" }
    }

    if (date.toDateString() === tomorrow.toDateString()) {
      return { text: "Besok", color: "text-yellow-600" }
    }

    return {
      text: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      color: "text-muted-foreground",
    }
  }

  if (topTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Tugas Prioritas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="font-medium mb-2">Semua tugas selesai!</h3>
            <p className="text-sm text-muted-foreground mb-4">Tidak ada tugas yang perlu dikerjakan saat ini</p>
            <Link href="/tasks">
              <Button variant="outline" size="sm">
                Lihat Semua Tugas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top 3 Tugas Prioritas</CardTitle>
        <Link href="/tasks">
          <Button variant="outline" size="sm">
            Lihat Semua
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {topTasks.map((task, index) => {
          const score = calculateTaskScore(task)
          const dueInfo = formatDueDate(task.dueDate)

          return (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-medium text-muted-foreground w-4">#{index + 1}</span>
                <button onClick={() => onToggleStatus(task.id)}>{getStatusIcon(task.status)}</button>
                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      "font-medium text-balance",
                      task.status === "done" && "line-through text-muted-foreground",
                    )}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{task.estHours}h</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn("text-white text-xs", getScoreColor(score))}>
                  {score}
                </Badge>
                <span className={cn("text-sm font-medium", dueInfo.color)}>{dueInfo.text}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
