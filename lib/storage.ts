// lib/storage.ts
import type { AppState } from "./types";

const STORAGE_KEY = "task-finance-planner";

// --- Data awal (mock) saat belum ada apa-apa di localStorage ---
const mockData: AppState = {
  tasks: [
    {
      id: "t1",
      title: "Kerjakan laporan AI",
      desc: "Selesaikan bab metode",
      dueDate: "2025-09-14T18:00:00+07:00",
      weight: 4,
      estHours: 3,
      status: "todo",
      category: "Kuliah",
      createdAt: new Date().toISOString(),
    },
    {
      id: "t2",
      title: "Buat desain landing",
      desc: "Client relaxdayspa",
      dueDate: "2025-09-12T12:00:00+07:00",
      weight: 3,
      estHours: 2,
      status: "in-progress",
      category: "Freelance",
      createdAt: new Date().toISOString(),
    },
  ],
  transactions: [
    {
      id: "tx1",
      type: "income",
      amount: 1500000,
      date: new Date().toISOString(),
      category: "Freelance",
      note: "DP desain",
    },
    {
      id: "tx2",
      type: "expense",
      amount: 120000,
      date: new Date().toISOString(),
      category: "Makan",
      note: "Makan siang",
    },
  ],
  // ⬇️ auth default TIDAK mengecek sesi di sini
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  },
};

// --- Helper ID sederhana ---
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// --- Load state dari localStorage (tanpa urus auth/session) ---
export function loadAppState(): AppState {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return mockData;
    const parsed = JSON.parse(raw) as Partial<AppState>;

    return {
      tasks: parsed.tasks ?? mockData.tasks,
      transactions: parsed.transactions ?? mockData.transactions,
      auth: parsed.auth ?? mockData.auth,
    };
  } catch {
    return mockData;
  }
}

// --- Save state ke localStorage (dipanggil dari store.ts) ---
export function saveAppState(state: Pick<AppState, "tasks" | "transactions" | "auth">) {
  try {
    if (typeof window === "undefined") return;
    const payload: AppState = {
      tasks: state.tasks,
      transactions: state.transactions,
      auth: state.auth,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}
