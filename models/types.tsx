export type UserRole = "admin" | "manager" | "worker";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  branch_id: number | null;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  start_date: string; // YYYY-MM-DD format
  predicted_duration: number; // in days
  end_date: string; // YYYY-MM-DD format
  notes: string;
  status: string;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: number;
  name: string;
  manager_id: number | null;
}
