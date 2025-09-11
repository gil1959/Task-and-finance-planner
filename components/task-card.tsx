"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { calculateTaskScore } from "@/lib/score"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onToggleStatus: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onToggleStatus, onEdit, onDelete }: TaskCardProps) {
  const score = calculateTaskScore(task)
  const dueDate = new Date(task.dueDate)
  const isOverdue = dueDate < new Date() && task.status !== "done"
  const isToday = dueDate.toDateString() === new Date().toDateString()

  const getStatusIcon = () => {
    switch (task.status) {
      case "done":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusProgress = () => {
    switch (task.status) {
      case "done":
        return 100
      case "in-progress":
        return 50
      default:
        return 0
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-red-500"
    if (score >= 60) return "bg-orange-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", isOverdue && "border-red-200 bg-red-50/50")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button onClick={() => onToggleStatus(task.id)} className="mt-0.5 flex-shrink-0">
              {getStatusIcon()}
            </button>
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-medium text-balance text-sm sm:text-base",
                  task.status === "done" && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>
              {task.desc && <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-pretty">{task.desc}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary" className={cn("text-white text-xs", getScoreColor(score))}>
              {score}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <Progress value={getStatusProgress()} className="h-2" />

          <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {task.category}
              </Badge>
              <span className="text-muted-foreground">{task.estHours}h</span>
            </div>

            <div
              className={cn(
                "font-medium text-xs sm:text-sm",
                isOverdue && "text-red-600",
                isToday && "text-orange-600",
              )}
            >
              {isOverdue
                ? "Terlambat"
                : isToday
                  ? "Hari ini"
                  : dueDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: window.innerWidth < 640 ? undefined : "numeric",
                    })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
