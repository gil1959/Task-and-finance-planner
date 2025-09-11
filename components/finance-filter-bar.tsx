"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, Search, X } from "lucide-react"

interface FilterState {
  search: string
  type: string
  category: string
  dateRange: string
}

interface FinanceFilterBarProps {
  onFiltersChange: (filters: FilterState) => void
  transactionCount: number
}

const types = ["Semua", "income", "expense", "investment"]
const dateRanges = ["Semua", "today", "this-month", "last-month"]

export function FinanceFilterBar({ onFiltersChange, transactionCount }: FinanceFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "Semua",
    category: "Semua",
    dateRange: "Semua",
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
      type: "Semua",
      category: "Semua",
      dateRange: "Semua",
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.search || filters.type !== "Semua" || filters.category !== "Semua" || filters.dateRange !== "Semua"

  const getTypeLabel = (value: string) => {
    switch (value) {
      case "income":
        return "Pemasukan"
      case "expense":
        return "Pengeluaran"
      case "investment":
        return "Investasi"
      default:
        return "Semua"
    }
  }

  const getDateRangeLabel = (value: string) => {
    switch (value) {
      case "today":
        return "Hari ini"
      case "this-month":
        return "Bulan ini"
      case "last-month":
        return "Bulan lalu"
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
              placeholder="Cari transaksi..."
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

        <div className="text-sm text-muted-foreground">{transactionCount} transaksi</div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipe</label>
            <Select value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Periode</label>
            <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {getDateRangeLabel(range)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <Input
              placeholder="Filter kategori..."
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
