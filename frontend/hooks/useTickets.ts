import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  client,
  GET_TICKETS,
  GET_TICKET,
  MY_TICKETS,
  MY_ASSIGNED_TICKETS,
  GET_USERS,
  GET_COMPANIES_FOR_TICKET,
  CREATE_TICKET,
  UPDATE_TICKET,
  ASSIGN_TICKET,
  DELETE_TICKET,
  CREATE_COMMENT,
  UPDATE_COMMENT,
  DELETE_COMMENT,
} from "@/lib/graphql";
import type {
  TicketsResponse,
  UsersResponse,
  CompaniesResponse,
  TicketFilters,
  CreateTicketResponse,
  UpdateTicketResponse,
  TicketCreateInput,
  TicketUpdateInput,
  TicketResponse,
  CreateCommentResponse,
  CommentCreateInput,
  CommentUpdateInput,
} from "@/lib/graphql";

export function useTickets(filters?: TicketFilters, limit = 100, offset = 0) {
  return useQuery<TicketsResponse>({
    queryKey: ["tickets", filters, limit, offset],
    queryFn: () =>
      client.request<TicketsResponse>(GET_TICKETS, {
        filters,
        limit,
        offset,
      }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useTicket(id: string) {
  return useQuery<TicketResponse>({
    queryKey: ["ticket", id],
    queryFn: () => client.request<TicketResponse>(GET_TICKET, { id }),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useMyTickets() {
  return useQuery({
    queryKey: ["my-tickets"],
    queryFn: () => client.request(MY_TICKETS),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMyAssignedTickets() {
  return useQuery({
    queryKey: ["my-assigned-tickets"],
    queryFn: () => client.request(MY_ASSIGNED_TICKETS),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUsers() {
  return useQuery<UsersResponse>({
    queryKey: ["users"],
    queryFn: () => client.request<UsersResponse>(GET_USERS),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCompaniesForTicket() {
  return useQuery<CompaniesResponse>({
    queryKey: ["companies-for-ticket"],
    queryFn: () => client.request<CompaniesResponse>(GET_COMPANIES_FOR_TICKET),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation<CreateTicketResponse, Error, TicketCreateInput>({
    mutationFn: (data: TicketCreateInput) =>
      client.request<CreateTicketResponse>(CREATE_TICKET, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["my-assigned-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.refetchQueries({ queryKey: ["tickets"] });
      queryClient.refetchQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateTicketResponse,
    Error,
    { id: string; data: TicketUpdateInput }
  >({
    mutationFn: ({ id, data }: { id: string; data: TicketUpdateInput }) =>
      client.request<UpdateTicketResponse>(UPDATE_TICKET, { id, data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["my-assigned-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.refetchQueries({ queryKey: ["tickets"] });
      queryClient.refetchQueries({ queryKey: ["ticket", variables.id] });
      queryClient.refetchQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) =>
      client.request(ASSIGN_TICKET, { id, assignedToId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["my-assigned-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.request(DELETE_TICKET, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["my-assigned-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.refetchQueries({ queryKey: ["tickets"] });
      queryClient.refetchQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation<CreateCommentResponse, Error, CommentCreateInput>({
    mutationFn: (data: CommentCreateInput) =>
      client.request<CreateCommentResponse>(CREATE_COMMENT, { data }),
    onSuccess: (_result, variables) => {
      const ticketId = variables.ticketId;
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.refetchQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommentUpdateInput }) =>
      client.request(UPDATE_COMMENT, { id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket"] });
      queryClient.refetchQueries({ queryKey: ["ticket"] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.request(DELETE_COMMENT, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket"] });
      queryClient.refetchQueries({ queryKey: ["ticket"] });
    },
  });
}
