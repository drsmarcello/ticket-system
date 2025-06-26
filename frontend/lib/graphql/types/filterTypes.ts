// Filter Types
export interface TicketFilters {
  status?:
    | "NEW"
    | "IN_PROGRESS"
    | "WAITING_FOR_CUSTOMER"
    | "COMPLETED"
    | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedToId?: string | null;
  companyId?: string;
  createdById?: string;
}
