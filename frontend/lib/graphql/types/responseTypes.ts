import type { Ticket, Company, Contact, TimeEntry } from "@/lib/graphql";

export interface TicketsResponse {
  tickets: Ticket[];
}

export interface TicketResponse {
  ticket: Ticket;
}

export interface CreateTicketResponse {
  createTicket: Ticket;
}

export interface UpdateTicketResponse {
  updateTicket: Ticket;
}

export interface CompanyResponse {
  company: Company;
}

export interface CreateCompanyResponse {
  createCompany: Company;
}

export interface UpdateCompanyResponse {
  updateCompany: Company;
}

export interface CreateContactResponse {
  createContact: Contact;
}

export interface UpdateContactResponse {
  updateContact: Contact;
}

export interface CreateCommentResponse {
  createComment: Comment;
}

export interface UpdateCommentResponse {
  updateComment: Comment;
}

export interface CreateTimeEntryResponse {
  createTimeEntry: TimeEntry;
}

export interface UpdateTimeEntryResponse {
  updateTimeEntry: TimeEntry;
}

export interface CompaniesResponse {
  companies: Company[];
}
