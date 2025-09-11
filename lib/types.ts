// lib/types.ts
export interface Task {
  id: string;
  title: string;
  desc: string;
  dueDate: string;
  weight: number; // 1-5
  estHours: number;
  status: "todo" | "in-progress" | "done";
  category: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  amount: number;
  date: string;
  category: string;
  note: string;
}

export interface User {
  id: number;                 // <— number (bukan string)
  email: string;
  name: string | null;        // <— nullable (sesuai DB)
  createdAt?: string;         // <— opsional (JSON serialize dari Date)
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  tasks: Task[];
  transactions: Transaction[];
  auth: AuthState;
}
