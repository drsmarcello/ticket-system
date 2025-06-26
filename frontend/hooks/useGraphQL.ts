import { useQuery, useMutation } from "@tanstack/react-query";
import {
  client,
  GET_COMPANIES,
  GET_COMPANIES_FOR_TICKET,
  GET_COMPANY,
} from "@/lib/graphql";
import type { CompaniesResponse, CompanyResponse } from "@/lib/graphql";

// Company hooks
export function useCompanies() {
  return useQuery<CompaniesResponse>({
    queryKey: ["companies"],
    queryFn: () => client.request<CompaniesResponse>(GET_COMPANIES),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompaniesForTicket() {
  return useQuery<CompaniesResponse>({
    queryKey: ["companies", "for-ticket"],
    queryFn: () => client.request<CompaniesResponse>(GET_COMPANIES_FOR_TICKET),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCompany(id: string) {
  return useQuery<CompanyResponse>({
    queryKey: ["company", id],
    queryFn: () => client.request<CompanyResponse>(GET_COMPANY, { id }),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// Generic hooks for your GraphQL operations
export function useGraphQLQuery<
  TData = any,
  TVariables extends object = Record<string, any>,
>(
  queryKey: (string | number | boolean)[],
  query: string,
  variables?: TVariables,
  options?: any,
) {
  return useQuery<TData>({
    queryKey,
    queryFn: () => client.request<TData>(query, variables),
    ...options,
  });
}

export function useGraphQLMutation<
  TData = any,
  TVariables extends object = Record<string, any>,
>(mutation: string, options?: any) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => client.request<TData>(mutation, variables),
    ...options,
  });
}