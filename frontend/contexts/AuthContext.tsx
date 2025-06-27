"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  client,
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  GET_ME
} from "@/lib/graphql";
import type {
  User,
  LoginResponse,
  RegisterResponse,
  MeResponse,
  LoginInput,
  RegisterInput,
} from "@/lib/graphql";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("token");
      setToken(savedToken);

      if (savedToken) {
        client.setHeader("Authorization", `Bearer ${savedToken}`);
      } else {
        client.setHeader("Authorization", "");
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      client.setHeader("Authorization", `Bearer ${token}`);
    } else {
      client.setHeader("Authorization", "");
    }
  }, [token]);

  const { data: meData, isLoading: meLoading } = useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => client.request<MeResponse>(GET_ME),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
    }
  }, [meData]);

  const loginMutation = useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async ({ email, password }: LoginInput) => {
      return client.request<LoginResponse>(LOGIN_MUTATION, {
        data: { email, password },
      });
    },
    onSuccess: (data) => {
      const { token: newToken, user: newUser } = data.login;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(newUser);
      client.setHeader("Authorization", `Bearer ${newToken}`);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Willkommen zurück, ${newUser.name}!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Login fehlgeschlagen");
    },
  });

  const registerMutation = useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: async ({ name, email, password }: RegisterInput) => {
      return client.request<RegisterResponse>(REGISTER_MUTATION, {
        data: { name, email, password },
      });
    },
    onSuccess: (data) => {
      const { token: newToken, user: newUser } = data.register;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(newUser);
      client.setHeader("Authorization", `Bearer ${newToken}`);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Willkommen, ${newUser.name}!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Registrierung fehlgeschlagen");
    },
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (err) {
      console.error("❌ Login error:", err);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      await registerMutation.mutateAsync({ name, email, password });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    client.setHeader("Authorization", "");
    queryClient.clear();
    toast.success("Erfolgreich abgemeldet");
    window.location.href = "/login";
  };

  const loading =
    meLoading || loginMutation.isPending || registerMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
