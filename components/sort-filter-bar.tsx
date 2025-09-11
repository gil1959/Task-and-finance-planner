"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, Search, X } from "lucide-react"

interface FilterState {
  search: string
  category: string
  status: string
  dueDateRange: string
  minScore: string
}

interface SortFilterBarProps {
  onFiltersChange: (filters: FilterState) => void
  taskCount: number
}

const categories = ["Semua", "Kuliah", "Freelance", "Pribadi", "Pekerjaan", "Lainnya"]
const statuses = ["Semua", "todo", "in-progress", "done"]
const dueDateRanges = ["Semua", "today", "tomorrow", "this-week", "overdue"]

export function SortFilterBar({ onFiltersChange, taskCount }: SortFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "Semua",
    status: "Semua",
    dueDateRange: "Semua",
    minScore: "",
  })

  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      category: "Semua",
      status: "Semua",
      dueDateRange: "Semua",
      minScore: "",
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.search ||
    filters.category !== "Semua" ||
    filters.status !== "Semua" ||
    filters.dueDateRange !== "Semua" ||
    filters.minScore

  const getDueDateRangeLabel = (value: string) => {
    switch (value) {
      case "today":
        return "Hari ini"
      case "tomorrow":
        return "Besok"
      case "this-week":
        return "Minggu ini"
      case "overdue":
        return "Terlambat"
      default:
        return "Semua"
    }
  }

  const getStatusLabel = (value: string) => {
    switch (value) {
      case "todo":
        return "To Do"
      case "in-progress":
        return "In Progress"
      case "done":
        return "Done"
      default:
        return "Semua"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari tugas..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-64 pl-10"
            />
          </div>

          <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                !
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">{taskCount} tugas</div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
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
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deadline</label>
            <Select value={filters.dueDateRange} onValueChange={(value) => updateFilter("dueDateRange", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dueDateRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {getDueDateRangeLabel(range)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Min Score</label>
            <Input
              type="number"
              placeholder="0-100"
              value={filters.minScore}
              onChange={(e) => updateFilter("minScore", e.target.value)}
              min="0"
              max="100"
            />
          </div>
        </div>
      )}
    </div>
  )
}
