import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AppState, User } from "../types";
import { loadState, saveState, registerUser, recomputeOverdue } from "./store";

interface AuthContextValue {
  state: AppState;
  currentUser: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  register: (p: {
    name: string;
    email: string;
    password: string;
    flat?: string;
    phone?: string;
  }) => { ok: boolean; error?: string };
  setState: (next: AppState) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(() => recomputeOverdue(loadState()));

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Recompute overdue every minute (in case the page is left open)
  useEffect(() => {
    const id = setInterval(() => {
      setStateRaw((s) => recomputeOverdue(s));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const setState = (next: AppState) => setStateRaw(next);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) || null,
    [state.users, state.currentUserId]
  );

  const login = (email: string, password: string) => {
    const u = state.users.find(
      (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password
    );
    if (!u) return { ok: false, error: "Invalid email or password." };
    setStateRaw((s) => ({ ...s, currentUserId: u.id }));
    return { ok: true };
  };

  const logout = () => {
    setStateRaw((s) => ({ ...s, currentUserId: null }));
  };

  const register = (payload: {
    name: string;
    email: string;
    password: string;
    flat?: string;
    phone?: string;
  }) => {
    const { state: next, user, error } = registerUser(state, payload);
    if (!user) return { ok: false, error };
    setStateRaw({ ...next, currentUserId: user.id });
    return { ok: true };
  };

  const value: AuthContextValue = {
    state,
    currentUser,
    login,
    logout,
    register,
    setState,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
