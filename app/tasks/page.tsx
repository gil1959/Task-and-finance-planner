"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/task-list";
import { TaskModal } from "@/components/task-modal";
import { SortFilterBar } from "@/components/sort-filter-bar";
import { useAppStore } from "@/lib/store";
import { Plus } from "lucide-react";
import type { Task } from "@/lib/types";

interface FilterState {
  search: string;
  category: string;
  status: string;
  dueDateRange: string;
  minScore: string;
}

export default function TasksPage() {
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const toggleTaskStatus = useAppStore((s) => s.toggleTaskStatus);
  const loadData = useAppStore((s) => s.loadData);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "Semua",
    status: "Semua",
    dueDateRange: "Semua",
    minScore: "",
  });

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

  const handleSaveTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }
    setEditingTask(null);
    setModalOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Yakin mau hapus? Tindakan ini nggak bisa dibalikin.")) {
      await deleteTask(id);
    }
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground">Kelola dan prioritaskan tugas Anda</p>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Cepat
            </Button>
          </div>

          <SortFilterBar onFiltersChange={setFilters} taskCount={tasks.length} />

          <TaskList
            tasks={tasks}
            filters={filters}
            onToggleStatus={async (id) => await toggleTaskStatus(id)}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />

          <TaskModal open={modalOpen} onOpenChange={setModalOpen} task={editingTask} onSave={handleSaveTask} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
