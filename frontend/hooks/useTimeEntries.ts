import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TimeEntriesResponse,
  TimeEntryFilters,
  CreateTimeEntryResponse,
  UpdateTimeEntryResponse,
  TimeEntryCreateInput,
  TimeEntryUpdateInput,
  TimeEntryResponse,
} from "@/lib/graphql";
import {
  client,
  GET_TIME_ENTRIES,
  GET_TIME_ENTRY,
  MY_TIME_ENTRIES,
  CREATE_TIME_ENTRY,
  UPDATE_TIME_ENTRY,
  DELETE_TIME_ENTRY,
} from "@/lib/graphql";

export function useTimeEntries(
  filters?: TimeEntryFilters,
  limit = 100,
  offset = 0,
) {
  return useQuery<TimeEntriesResponse>({
    queryKey: ["time-entries", filters, limit, offset],
    queryFn: () =>
      client.request<TimeEntriesResponse>(GET_TIME_ENTRIES, {
        filters,
        limit,
        offset,
      }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useTimeEntry(id: string) {
  return useQuery<TimeEntryResponse>({
    queryKey: ["time-entry", id],
    queryFn: () => client.request<TimeEntryResponse>(GET_TIME_ENTRY, { id }),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useMyTimeEntries(from?: string, to?: string) {
  return useQuery({
    queryKey: ["my-time-entries", from, to],
    queryFn: () => client.request(MY_TIME_ENTRIES, { from, to }),
    staleTime: 2 * 60 * 1000,
  });
}

// Mutations
export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation<CreateTimeEntryResponse, Error, TimeEntryCreateInput>({
    mutationFn: (data: TimeEntryCreateInput) =>
      client.request<CreateTimeEntryResponse>(CREATE_TIME_ENTRY, { data }),
    onSuccess: (_result, variables) => {
      // Invalidate and refetch time entry queries
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["my-time-entries"] });
      // Also invalidate the specific ticket to update time entries there
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId],
      });

      // Refetch active queries
      queryClient.refetchQueries({ queryKey: ["time-entries"] });
      queryClient.refetchQueries({ queryKey: ["ticket", variables.ticketId] });
    },
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateTimeEntryResponse,
    Error,
    { id: string; data: TimeEntryUpdateInput }
  >({
    mutationFn: ({ id, data }: { id: string; data: TimeEntryUpdateInput }) =>
      client.request<UpdateTimeEntryResponse>(UPDATE_TIME_ENTRY, { id, data }),
    onSuccess: (_result, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["time-entry", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["my-time-entries"] });
      // Also invalidate tickets that might show this time entry
      queryClient.invalidateQueries({ queryKey: ["ticket"] });

      // Refetch active queries
      queryClient.refetchQueries({ queryKey: ["time-entries"] });
      queryClient.refetchQueries({ queryKey: ["time-entry", variables.id] });
    },
  });
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.request(DELETE_TIME_ENTRY, { id }),
    onSuccess: () => {
      // Invalidate all time entry related queries
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["my-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["ticket"] });

      // Refetch active queries
      queryClient.refetchQueries({ queryKey: ["time-entries"] });
    },
  });
}
