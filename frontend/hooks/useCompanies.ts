import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  client,
  GET_COMPANIES,
  GET_COMPANIES_FOR_TICKET,
  GET_COMPANY,
  CREATE_COMPANY,
  UPDATE_COMPANY,
  DELETE_COMPANY,
  CREATE_CONTACT,
  UPDATE_CONTACT,
  DELETE_CONTACT,
} from "@/lib/graphql";
import type {
  CompaniesResponse,
  CompanyResponse,
  CreateCompanyResponse,
  UpdateCompanyResponse,
  CompanyCreateInput,
  CompanyUpdateInput,
  ContactCreateInput,
  ContactUpdateInput,
} from "@/lib/graphql";

export function useCompanies() {
  return useQuery<CompaniesResponse>({
    queryKey: ["companies"],
    queryFn: () => client.request<CompaniesResponse>(GET_COMPANIES),
    staleTime: 5 * 60 * 1000,
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

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CreateCompanyResponse, Error, CompanyCreateInput>({
    mutationFn: (data: CompanyCreateInput) =>
      client.request<CreateCompanyResponse>(CREATE_COMPANY, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", "for-ticket"] });
      queryClient.refetchQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCompanyResponse,
    Error,
    { id: string; data: CompanyUpdateInput }
  >({
    mutationFn: ({ id, data }: { id: string; data: CompanyUpdateInput }) =>
      client.request<UpdateCompanyResponse>(UPDATE_COMPANY, { id, data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] });
      queryClient.refetchQueries({ queryKey: ["companies"] });
      queryClient.refetchQueries({ queryKey: ["company", variables.id] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.request(DELETE_COMPANY, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", "for-ticket"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.refetchQueries({ queryKey: ["companies"] });
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ContactCreateInput) =>
      client.request(CREATE_CONTACT, { data }),
    onSuccess: (_result) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", "for-ticket"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      queryClient.refetchQueries({ queryKey: ["companies"] });
      queryClient.refetchQueries({ queryKey: ["company"] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactUpdateInput }) =>
      client.request(UPDATE_CONTACT, { id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      queryClient.refetchQueries({ queryKey: ["companies"] });
      queryClient.refetchQueries({ queryKey: ["company"] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.request(DELETE_CONTACT, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      queryClient.refetchQueries({ queryKey: ["companies"] });
      queryClient.refetchQueries({ queryKey: ["company"] });
    },
  });
}
