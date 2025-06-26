// Ticket Types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status:
    | "NEW"
    | "IN_PROGRESS"
    | "WAITING_FOR_CUSTOMER"
    | "COMPLETED"
    | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  company: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  contact: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  timeEntries?: TimeEntry[];
  comments?: Comment[];
  histories?: History[];
}

export interface TimeEntry {
  id: string;
  description: string;
  duration?: number;
  billable?: boolean;
  startTime: string;
  endTime?: string;
  user: {
    id: string;
    name: string;
  };
  ticket?: {
    id: string;
    title: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  isInternal?: boolean;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: string;
    name: string;
  };
  ticket?: {
    id: string;
  };
}

export interface History {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}
