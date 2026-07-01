export type Role = "resident" | "admin";

export type ComplaintStatus = "Open" | "In Progress" | "Resolved";

export type Priority = "Low" | "Medium" | "High";

export type Category =
  | "Plumbing"
  | "Electrical"
  | "Cleaning"
  | "Lift"
  | "Security"
  | "Parking"
  | "Other";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  flat?: string;
  phone?: string;
  createdAt: string;
}

export interface StatusEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  from: ComplaintStatus | "Created";
  to: ComplaintStatus;
  note?: string;
}

export interface ComplaintPhoto {
  id: string;
  name: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: ComplaintStatus;
  residentId: string;
  residentName: string;
  flat: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  photos: ComplaintPhoto[];
  history: StatusEvent[];
  overdue: boolean;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  important: boolean;
  pinned: boolean;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  sentAt: string;
  category: "status-change" | "important-notice" | "registration";
}

export interface AppConfig {
  overdueDays: number;
  societyName: string;
}

export interface AppState {
  users: User[];
  complaints: Complaint[];
  notices: Notice[];
  emails: EmailLog[];
  config: AppConfig;
  currentUserId: string | null;
}
