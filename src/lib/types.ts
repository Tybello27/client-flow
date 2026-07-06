export type ID = string;

export type Priority = "low" | "medium" | "high";

export type ClientStatus = "active" | "completed" | "overdue" | "prospect";

export interface Client {
  id: ID;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatarColor: string;
  initials: string;
  status: ClientStatus;
  priority: Priority;
  tags: string[];
  website?: string;
  location?: string;
  notes?: string;
  createdAt: number;
}

export type LeadStage =
  | "new"
  | "contacted"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Lead {
  id: ID;
  name: string;
  company: string;
  stage: LeadStage;
  value: number;
  progress: number;
  email?: string;
  source?: string;
  createdAt: number;
}

export type QuoteStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected";

export interface QuoteItem {
  id: ID;
  label: string;
  qty: number;
  price: number;
}

export interface Quote {
  id: ID;
  number: string;
  clientId: ID;
  status: QuoteStatus;
  items: QuoteItem[];
  createdAt: number;
  validUntil: number;
}

export interface Milestone {
  id: ID;
  title: string;
  done: boolean;
}

export type ProjectStatus = "active" | "on-hold" | "completed";

export interface Project {
  id: ID;
  name: string;
  clientId: ID;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  budget: number;
  deadline: number;
  milestones: Milestone[];
  createdAt: number;
}

export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export interface Invoice {
  id: ID;
  number: string;
  clientId: ID;
  amount: number;
  status: InvoiceStatus;
  issuedAt: number;
  dueAt: number;
  paidAt?: number;
}

export interface ActionItem {
  id: ID;
  text: string;
  done: boolean;
}

export interface Note {
  id: ID;
  title: string;
  clientId: ID;
  body: string;
  followUpAt?: number;
  actionItems: ActionItem[];
  attachments: string[];
  createdAt: number;
}

export type EventType =
  | "meeting"
  | "deadline"
  | "invoice"
  | "milestone";

export interface CalendarEvent {
  id: ID;
  title: string;
  type: EventType;
  date: number;
  clientId?: ID;
}

export type ActivityType =
  | "client"
  | "invoice"
  | "project"
  | "quote"
  | "lead"
  | "note";

export interface Activity {
  id: ID;
  type: ActivityType;
  text: string;
  at: number;
}

export interface Notification {
  id: ID;
  title: string;
  body: string;
  at: number;
  read: boolean;
  kind: "info" | "success" | "warning";
}

export interface Profile {
  name: string;
  email: string;
  role: string;
  business: string;
  avatarColor: string;
}

export interface AppData {
  version: number;
  profile: Profile;
  clients: Client[];
  leads: Lead[];
  quotes: Quote[];
  projects: Project[];
  invoices: Invoice[];
  notes: Note[];
  events: CalendarEvent[];
  activities: Activity[];
  notifications: Notification[];
}
