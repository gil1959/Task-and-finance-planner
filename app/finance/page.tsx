"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { FinanceSummary } from "@/components/finance-summary";
import { TransactionList } from "@/components/transaction-list";
import { TransactionModal } from "@/components/transaction-modal";
import { CategoryModal } from "@/components/category-modal";
import { FinanceFilterBar } from "@/components/finance-filter-bar";
import { useAppStore } from "@/lib/store";
import { Plus } from "lucide-react";
import type { Transaction } from "@/lib/types";

interface FilterState {
  search: string;
  type: string;
  category: string;
  dateRange: string;
}

export default function FinancePage() {
  const user = useAppStore((s) => s.auth.user);
  const transactions = useAppStore((s) => s.transactions);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const loadData = useAppStore((s) => s.loadData);
  const updateInitialBalance = useAppStore((s) => s.updateInitialBalance);
  const loadFinanceInsight = useAppStore((s) => s.loadFinanceInsight);
  const financeInsight = useAppStore((s) => s.financeInsight);

  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "Semua",
    category: "Semua",
    dateRange: "Semua",
  });

  useEffect(() => {
    (async () => {
      await loadData();
      await loadFinanceInsight();
    })();
  }, [loadData, loadFinanceInsight]);

  const handleSaveTransaction = async (data: Omit<Transaction, "id">) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
    setEditingTransaction(null);
    setModalOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Yakin mau hapus? Tindakan ini nggak bisa dibalikin.")) {
      await deleteTransaction(id);
    }
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
              <p className="text-muted-foreground">Kelola pemasukan, pengeluaran, dan investasi</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
                Kelola Kategori
              </Button>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            </div>
          </div>

          <FinanceSummary 
            transactions={transactions} 
            initialBalance={user?.initialBalance || 0}
            onUpdateInitialBalance={updateInitialBalance}
          />

          {financeInsight && (
            <div className="rounded-lg border p-4 bg-muted/20">
              <h3 className="font-semibold mb-2">💡 Saran AI Bulan Ini</h3>
              <div className="text-sm whitespace-pre-line text-muted-foreground">
                {financeInsight.insight}
              </div>
            </div>
          )}

          <FinanceFilterBar onFiltersChange={setFilters} transactionCount={transactions.length} />

          <TransactionList
            transactions={transactions}
            filters={filters}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />

          <TransactionModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            transaction={editingTransaction}
            onSave={handleSaveTransaction}
          />

          <CategoryModal
            open={categoryModalOpen}
            onOpenChange={setCategoryModalOpen}
          />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
