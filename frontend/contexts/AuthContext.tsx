// frontend/src/contexts/AuthContext.tsx (SSR-SAFE VERSION)
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
import { TokenManager } from "@/utils/tokenManager";
import {
  client,
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
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
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const queryClient = useQueryClient();

  // 🌐 Client-side initialization
  useEffect(() => {
    setIsClient(true);
    
    TokenManager.initialize().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Get user data if authenticated (only on client)
  const { data: meData, isLoading: meLoading, refetch: refetchMe } = useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => client.request<MeResponse>(GET_ME),
    enabled: isClient && isInitialized && TokenManager.isAuthenticated(),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
    } else if (isClient && isInitialized && !meLoading && !TokenManager.isAuthenticated()) {
      setUser(null);
    }
  }, [meData, isClient, isInitialized, meLoading]);

  // Login mutation
  const loginMutation = useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async ({ email, password }: LoginInput) => {
      return client.request<LoginResponse>(LOGIN_MUTATION, {
        data: { email, password },
      });
    },
    onSuccess: (data) => {
      const { accessToken, refreshToken, user: newUser } = data.login;
      
      TokenManager.setTokens(accessToken, refreshToken);
      setUser(newUser);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Willkommen zurück, ${newUser.name}!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Login fehlgeschlagen");
    },
  });

  // Register mutation
  const registerMutation = useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: async ({ name, email, password }: RegisterInput) => {
      return client.request<RegisterResponse>(REGISTER_MUTATION, {
        data: { name, email, password },
      });
    },
    onSuccess: (data) => {
      const { accessToken, refreshToken, user: newUser } = data.register;
      
      TokenManager.setTokens(accessToken, refreshToken);
      setUser(newUser);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Willkommen, ${newUser.name}!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Registrierung fehlgeschlagen");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return client.request(LOGOUT_MUTATION);
    },
    onSettled: () => {
      TokenManager.clearTokens();
      setUser(null);
      queryClient.clear();
      toast.success("Erfolgreich abgemeldet");
      if (typeof window !== 'undefined') {
        window.location.href = "/login";
      }
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

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const refreshUser = () => {
    refetchMe();
  };

  const loading =
    !isClient ||
    !isInitialized || 
    meLoading || 
    loginMutation.isPending || 
    registerMutation.isPending ||
    logoutMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: isClient && !!user && TokenManager.isAuthenticated(),
        refreshUser,
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