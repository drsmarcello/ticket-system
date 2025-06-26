import { useQuery } from "@tanstack/react-query";
import {
  client,
  DASHBOARD_QUERY,
  MY_ASSIGNED_TICKETS_QUERY,
  DASHBOARD_STATS_QUERY,
} from "@/lib/graphql";

export function useDashboard() {
  return useQuery<{ tickets: any[] }>({
    queryKey: ["dashboard"],
    queryFn: () => client.request<{ tickets: any[] }>(DASHBOARD_QUERY),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useMyAssignedTickets() {
  return useQuery<{ myAssignedTickets: any[] }>({
    queryKey: ["my-assigned-tickets"],
    queryFn: () =>
      client.request<{ myAssignedTickets: any[] }>(MY_ASSIGNED_TICKETS_QUERY),
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardStats() {
  return useQuery<{ tickets: any[] }>({
    queryKey: ["dashboard-stats"],
    queryFn: () => client.request<{ tickets: any[] }>(DASHBOARD_STATS_QUERY),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}
