import type { TimeEntry } from "@/lib/graphql";

// Input Types
export interface TicketCreateInput {
  title: string;
  description: string;
  companyId?: string;
  contactId?: string;
  assignedToId?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedMinutes?: number | null;
}

export interface TicketUpdateInput {
  title?: string;
  description?: string;
  status?:
    | "NEW"
    | "IN_PROGRESS"
    | "WAITING_FOR_CUSTOMER"
    | "COMPLETED"
    | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedToId?: string | null;
  companyId?: string;
  contactId?: string;
  estimatedMinutes?: number | null;
}

export interface CompanyCreateInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  primaryContactId?: string;
}

export interface CompanyUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  primaryContactId?: string;
}

export interface ContactCreateInput {
  name: string;
  email: string;
  phone?: string;
  companyId: string;
}

export interface ContactUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  companyId?: string;
}

export interface CommentCreateInput {
  ticketId: string;
  content: string;
  isInternal?: boolean;
}

export interface CommentUpdateInput {
  content?: string;
  isInternal?: boolean;
}

export interface TimeEntryCreateInput {
  ticketId: string;
  description: string;
  startTime: string;
  endTime: string;
  billable?: boolean;
}

export interface TimeEntryUpdateInput {
  description?: string;
  startTime?: string;
  endTime?: string;
  billable?: boolean;
}

export interface TimeEntriesResponse {
  timeEntries: TimeEntry[];
}

export interface TimeEntryFilters {
  userId?: string;
  ticketId?: string;
  from?: string;
  to?: string;
  billable?: boolean;
}

export interface TimeEntryResponse {
  timeEntry: {
    id: string;
    description: string;
    startTime: string;
    endTime: string;
    duration: number;
    billable: boolean;
    createdAt: string;
    updatedAt: string;
    ticket: {
      id: string;
      title: string;
      company: {
        id: string;
        name: string;
      };
    };
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}
