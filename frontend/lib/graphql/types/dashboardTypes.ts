import type { Ticket } from "@/lib/graphql";

export interface MyTicket {
  id: string;
  title: string;
  status: "NEW" | "OPEN" | "IN_PROGRESS" | "CLOSED" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  company?: {
    id: string;
    name: string;
  };
}

export interface TicketStatsItem {
  id: string;
  status: "NEW" | "OPEN" | "IN_PROGRESS" | "CLOSED" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface DashboardResponse {
  tickets: Ticket[];
  myAssignedTickets: MyTicket[];
}

export interface DashboardStatsResponse {
  tickets: TicketStatsItem[];
}
