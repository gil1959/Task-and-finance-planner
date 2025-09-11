"use client";

import { create } from "zustand";
import type { AppState, Task, Transaction } from "./types";
import {
  getCurrentSession,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
} from "./auth-client";
import type { SessionUser } from "./auth-client";

/* =========================
   Fetch helpers
   ========================= */
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPut<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

/* =========================
   Mappers (API ↔ FE)
   ========================= */
// Task (Prisma) → FE
function mapApiTaskToFE(api: any): Task {
  return {
    id: String(api.id),
    title: api.title,
    desc: api.description ?? "",
    dueDate: api.dueDate ? new Date(api.dueDate).toISOString() : "",
    weight: Number(api.priority ?? 0),
    estHours: 0, // tidak ada di DB; pakai default 0
    status: (api.status ?? "todo") as Task["status"], // "todo" | "in-progress" | "done"
    category: "", // tidak ada di DB; biarkan kosong
    createdAt: new Date(api.createdAt).toISOString(),
  };
}

// FE (tanpa id/createdAt) → Task (Prisma)
function mapFETaskToApi(fe: Omit<Task, "id" | "createdAt">) {
  return {
    title: fe.title,
    description: fe.desc ?? null,
    dueDate: fe.dueDate ? new Date(fe.dueDate) : null,
    priority: Number(fe.weight ?? 0),
    status: fe.status ?? "todo",
    // category & estHours TIDAK dikirim karena tidak ada di schema
  };
}

// Transaction (Prisma) → FE
function mapApiTxToFE(api: any): Transaction {
  return {
    id: String(api.id),
    type: (api.type?.toLowerCase?.() ?? "expense") as Transaction["type"], // enum to lowercase
    amount: Number(api.amount),
    date: new Date(api.date).toISOString(),
    category: api.category?.name ?? "", // kalau API include category
    note: api.note ?? "",
  };
}

// FE (tanpa id) → Transaction (Prisma)
function mapFETxToApi(fe: Omit<Transaction, "id">) {
  return {
    type: (fe.type ?? "expense").toUpperCase(), // INCOME | EXPENSE | INVESTMENT
    amount: Number(fe.amount),
    date: fe.date ? new Date(fe.date) : new Date(),
    note: fe.note ?? null,
    // categoryId: null, // kalau nanti pakai kategori relasi, isi di sini
  };
}

/* =========================
   Store
   ========================= */
interface AppStore extends AppState {
  // Tasks
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string | number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string | number) => Promise<void>;
  toggleTaskStatus: (id: string | number) => Promise<void>;

  // Transactions
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string | number, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string | number) => Promise<void>;

  // Auth
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: SessionUser; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: SessionUser; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // Load initial
  loadData: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  tasks: [],
  transactions: [],
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  },

  /* ===== Tasks (API) ===== */

  addTask: async (taskData) => {
    const payload = mapFETaskToApi(taskData);
    const created = await apiPost<any>("/api/tasks", payload);
    const fe = mapApiTaskToFE(created);
    set((state) => ({ tasks: [fe, ...state.tasks] }));
  },

  updateTask: async (id, updates) => {
    // bentuk minimal untuk mapper
    const payload = mapFETaskToApi({
      title: updates.title ?? "",
      desc: updates.desc ?? "",
      dueDate: updates.dueDate ?? "",
      weight: updates.weight ?? 0,
      estHours: updates.estHours ?? 0,
      status: (updates.status ?? "todo") as Task["status"],
      category: updates.category ?? "",
    });
    const updated = await apiPut<any>(`/api/tasks/${id}`, payload);
    const fe = mapApiTaskToFE(updated);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === String(id) ? fe : t)),
    }));
  },

  deleteTask: async (id) => {
    await apiDelete(`/api/tasks/${id}`);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== String(id)),
    }));
  },

  toggleTaskStatus: async (id) => {
    const curr = get().tasks.find((t) => t.id === String(id));
    if (!curr) return;

    const nextStatus: Task["status"] =
      curr.status === "done" ? "todo" : curr.status === "todo" ? "in-progress" : "done";

    const updated = await apiPut<any>(`/api/tasks/${id}`, { status: nextStatus });
    const fe = mapApiTaskToFE(updated);

    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === String(id) ? fe : t)),
    }));
  },

  /* ===== Transactions (API) ===== */

  addTransaction: async (txData) => {
    const payload = mapFETxToApi(txData);
    const created = await apiPost<any>("/api/transactions", payload);
    const fe = mapApiTxToFE(created);
    set((state) => ({ transactions: [fe, ...state.transactions] }));
  },

  updateTransaction: async (id, updates) => {
    const payload = mapFETxToApi({
      type: (updates.type ?? "expense") as Transaction["type"],
      amount: updates.amount ?? 0,
      date: updates.date ?? new Date().toISOString(),
      note: updates.note ?? "",
      category: updates.category ?? "", // FE only
    });
    const updated = await apiPut<any>(`/api/transactions/${id}`, payload);
    const fe = mapApiTxToFE(updated);
    set((state) => ({
      transactions: state.transactions.map((x) => (x.id === String(id) ? fe : x)),
    }));
  },

  deleteTransaction: async (id) => {
    await apiDelete(`/api/transactions/${id}`);
    set((state) => ({
      transactions: state.transactions.filter((x) => x.id !== String(id)),
    }));
  },

  /* ===== Auth ===== */

  login: async (email, password) => {
    set((state) => ({ auth: { ...state.auth, isLoading: true } }));
    const result = await authLogin({ email, password });
    if (result.success && result.user) {
      set(() => ({
        auth: { user: result.user!, isAuthenticated: true, isLoading: false },
      }));
      await get().loadData();
    } else {
      set((state) => ({ auth: { ...state.auth, isLoading: false } }));
    }
    return result;
  },

  register: async (name, email, password) => {
    set((state) => ({ auth: { ...state.auth, isLoading: true } }));
    const result = await authRegister({ name, email, password });
    if (result.success && result.user) {
      set(() => ({
        auth: { user: result.user!, isAuthenticated: true, isLoading: false },
      }));
      await get().loadData();
    } else {
      set((state) => ({ auth: { ...state.auth, isLoading: false } }));
    }
    return result;
  },

  logout: async () => {
    await authLogout();
    set({
      auth: { user: null, isAuthenticated: false, isLoading: false },
      tasks: [],
      transactions: [],
    });
  },

  checkAuth: async () => {
    const user = await getCurrentSession();
    set(() => ({
      auth: { user, isAuthenticated: !!user, isLoading: false },
    }));
    if (user) await get().loadData();
  },

  /* ===== Initial load (API) ===== */

  loadData: async () => {
    try {
      const [tasksApi, txApi] = await Promise.all([
        apiGet<any[]>("/api/tasks"),
        apiGet<any[]>("/api/transactions"),
      ]);
      const tasks = (tasksApi ?? []).map(mapApiTaskToFE);
      const transactions = (txApi ?? []).map(mapApiTxToFE);
      set((state) => ({ tasks, transactions, auth: state.auth }));
    } catch {
      // optional: tampilkan toast error
    }
  },
}));
