import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  client,
  GET_USER,
  GET_USERS,
  GET_ME,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  UPDATE_PROFILE,
  UPDATE_PASSWORD
} from "@/lib/graphql";
import type {
  UserResponse,
  UsersResponse,
  MeResponse,
  CreateUserResponse,
  UserCreateInput,
  UserUpdateInput,
  UpdateUserResponse,
  DeleteUserResponse,
  UpdateProfileResponse,
  EmailUpdateInput,
  PasswordUpdateInput
} from "@/lib/graphql";

export function useUsers() {
  return useQuery<UsersResponse>({
    queryKey: ["users"],
    queryFn: () => client.request<UsersResponse>(GET_USERS),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUser(id: string) {
  return useQuery<UserResponse>({
    queryKey: ["user", id],
    queryFn: () => client.request<UserResponse>(GET_USER, { id }),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useMe() {
  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => client.request<MeResponse>(GET_ME),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<CreateUserResponse, Error, UserCreateInput>({
    mutationFn: (data: UserCreateInput) =>
      client.request<CreateUserResponse>(CREATE_USER, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateUserResponse,
    Error,
    { id: string; data: UserUpdateInput }
  >({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateInput }) =>
      client.request<UpdateUserResponse>(UPDATE_USER, { id, data }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });

      queryClient.refetchQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["user", variables.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<DeleteUserResponse, Error, string>({
    mutationFn: (id: string) =>
      client.request<DeleteUserResponse>(DELETE_USER, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, UserUpdateInput>({
    mutationFn: (data: UserUpdateInput) =>
      client.request<UpdateProfileResponse>(UPDATE_PROFILE, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.refetchQueries({ queryKey: ["me"] });
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  return useMutation<UpdateProfileResponse, Error, PasswordUpdateInput>({
    mutationFn: (data: PasswordUpdateInput) =>
      client.request<UpdateProfileResponse>(UPDATE_PASSWORD, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.refetchQueries({ queryKey: ["me"] });
    },
  });
}

export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, EmailUpdateInput>({
    mutationFn: (data: EmailUpdateInput) =>
      client.request<UpdateProfileResponse>(UPDATE_PROFILE, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.refetchQueries({ queryKey: ["me"] });
    },
  });
}
