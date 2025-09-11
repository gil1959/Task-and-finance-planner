"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react"
import type { Task, Transaction } from "@/lib/types"
import Link from "next/link"

interface RecentActivityProps {
  tasks: Task[]
  transactions: Transaction[]
}

interface ActivityItem {
  id: string
  type: "task" | "transaction"
  title: string
  subtitle: string
  timestamp: Date
  icon: React.ReactNode
  badge?: string
}

export function RecentActivity({ tasks, transactions }: RecentActivityProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Combine and sort recent activities
  const activities: ActivityItem[] = []

  // Add recent tasks (completed in last 7 days)
  const recentTasks = tasks
    .filter((task) => {
      if (task.status !== "done") return false
      // For demo purposes, we'll show all completed tasks since we don't have completion timestamps
      return true
    })
    .slice(0, 3)

  recentTasks.forEach((task) => {
    activities.push({
      id: task.id,
      type: "task",
      title: task.title,
      subtitle: `Kategori: ${task.category}`,
      timestamp: new Date(task.createdAt),
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      badge: "Selesai",
    })
  })

  // Add recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  recentTransactions.forEach((transaction) => {
    const getIcon = () => {
      switch (transaction.type) {
        case "income":
          return <ArrowUpCircle className="h-4 w-4 text-green-500" />
        case "expense":
          return <ArrowDownCircle className="h-4 w-4 text-red-500" />
        case "investment":
          return <TrendingUp className="h-4 w-4 text-blue-500" />
      }
    }

    const getTypeLabel = () => {
      switch (transaction.type) {
        case "income":
          return "Pemasukan"
        case "expense":
          return "Pengeluaran"
        case "investment":
          return "Investasi"
      }
    }

    activities.push({
      id: transaction.id,
      type: "transaction",
      title: formatCurrency(transaction.amount),
      subtitle: `${getTypeLabel()} - ${transaction.category}`,
      timestamp: new Date(transaction.date),
      icon: getIcon(),
    })
  })

  // Sort by timestamp (most recent first)
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Take only the most recent 6 items
  const recentActivities = activities.slice(0, 6)

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-medium mb-2">Belum ada aktivitas</h3>
            <p className="text-sm text-muted-foreground">Mulai dengan menambahkan tugas atau transaksi</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <div className="flex gap-2">
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              Tasks
            </Button>
          </Link>
          <Link href="/finance">
            <Button variant="outline" size="sm">
              Finance
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentActivities.map((activity) => (
          <div
            key={`${activity.type}-${activity.id}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {activity.icon}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-balance">{activity.title}</p>
              <p className="text-xs text-muted-foreground text-pretty">{activity.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {activity.badge && (
                <Badge variant="secondary" className="text-xs">
                  {activity.badge}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {activity.timestamp.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
