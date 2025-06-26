import type { Ticket } from "@/lib/graphql";

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  primaryContact?: Contact;
  contacts: Contact[];
  tickets: Ticket[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: Company;
  tickets: Ticket[];
}
