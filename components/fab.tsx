"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { TaskModal } from "./task-modal"
import { TransactionModal } from "./transaction-modal"
import { Plus, CheckSquare, DollarSign } from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { Task, Transaction } from "@/lib/types"

export function FAB() {
  const pathname = usePathname()
  const { addTask, addTransaction } = useAppStore()
  const [fabOpen, setFabOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)

  // Don't show FAB on settings page
  if (pathname === "/settings") return null

  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    addTask(taskData)
    setFabOpen(false)
  }

  const handleAddTransaction = (transactionData: Omit<Transaction, "id">) => {
    addTransaction(transactionData)
    setFabOpen(false)
  }

  const openTaskModal = () => {
    setFabOpen(false)
    setTaskModalOpen(true)
  }

  const openTransactionModal = () => {
    setFabOpen(false)
    setTransactionModalOpen(true)
  }

  return (
    <>
      {/* FAB - Only visible on mobile */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Sheet open={fabOpen} onOpenChange={setFabOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Tambah Baru</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 mt-6 pb-6">
              <Button onClick={openTaskModal} className="h-16 flex-col gap-2">
                <CheckSquare className="h-6 w-6" />
                <span>Tugas</span>
              </Button>
              <Button onClick={openTransactionModal} variant="outline" className="h-16 flex-col gap-2 bg-transparent">
                <DollarSign className="h-6 w-6" />
                <span>Transaksi</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Modals */}
      <TaskModal open={taskModalOpen} onOpenChange={setTaskModalOpen} onSave={handleAddTask} />

      <TransactionModal
        open={transactionModalOpen}
        onOpenChange={setTransactionModalOpen}
        onSave={handleAddTransaction}
      />
    </>
  )
}
