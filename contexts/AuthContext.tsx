"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiClientError } from "@/lib/api-client";
import { isPublicTenantHost } from "@/lib/public-tenant-host";
import {
  getFirebaseAuth,
  isFirebaseClientConfigured,
} from "@/lib/firebase/client";
import * as authApi from "@/services/auth.api";
import * as userApi from "@/services/user.api";
import type { PublicUser } from "@/types/user";
import { signOut as firebaseSignOut } from "firebase/auth";

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  completeFirebaseLogin: (idToken: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await userApi.getMe();
      setUser(res.data);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        setUser(null);
        return;
      }
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (isPublicTenantHost()) {
      setUser(null);
      setLoading(false);
      return;
    }
    void (async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      setUser(res.data);
    },
    []
  );

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      const res = await authApi.signup({ email, password, name });
      setUser(res.data);
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    if (isFirebaseClientConfigured()) {
      try {
        await firebaseSignOut(getFirebaseAuth());
      } catch {
        /* ignore — session cookie is already cleared */
      }
    }
    setUser(null);
  }, []);

  const completeFirebaseLogin = useCallback(async (idToken: string) => {
    const res = await authApi.loginWithFirebase(idToken);
    setUser(res.data);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      completeFirebaseLogin,
      refreshUser,
    }),
    [user, loading, login, signup, logout, completeFirebaseLogin, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
