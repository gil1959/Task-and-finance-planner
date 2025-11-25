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

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface ScheduleItem {
  id: string;
  courseName: string;
  courseCode?: string;
  day: Weekday;          // "monday" | ... | "sunday"
  startTime: string;     // "08:00"
  endTime: string;       // "09:40"
  room?: string;
  lecturer?: string;
  semester: string;      // mis: "Ganjil 2024/2025"
  reminderHoursBefore: number; // jam sebelum kuliah (0 = off)
  createdAt: string;
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
  schedules: ScheduleItem[];
  auth: AuthState;
}
