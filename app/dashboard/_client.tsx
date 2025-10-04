"use client";
export const revalidate = 0;
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { KPIBar } from "@/components/kpi-bar";
import { PriorityTasks } from "@/components/priority-tasks";
import { QuickAdd } from "@/components/quick-add";
import { RecentActivity } from "@/components/recent-activity";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  // ✅ selector per-field (lebih stabil)
  const tasks = useAppStore((s) => s.tasks);
  const transactions = useAppStore((s) => s.transactions);
  const addTask = useAppStore((s) => s.addTask);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const toggleTaskStatus = useAppStore((s) => s.toggleTaskStatus);
  const loadData = useAppStore((s) => s.loadData);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Ringkasan tugas prioritas dan keuangan Anda</p>
          </div>

          <KPIBar tasks={tasks} transactions={transactions} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <PriorityTasks tasks={tasks} onToggleStatus={async (id) => await toggleTaskStatus(id)} />
              <RecentActivity tasks={tasks} transactions={transactions} />
            </div>

            <div className="space-y-6">
              <QuickAdd
                onAddTask={async (t) => await addTask(t)}
                onAddTransaction={async (tx) => await addTransaction(tx)}
              />
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
