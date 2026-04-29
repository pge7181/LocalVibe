import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken, formatErr } from "./api";

export type User = {
  id: string;
  email: string;
  name: string;
  role: "seeker" | "provider";
  provider_id?: string | null;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: "seeker" | "provider") => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const t = await getToken();
      if (!t) { setUser(null); return; }
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      await setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      await setToken(data.token);
      setUser(data.user);
    } catch (e) {
      throw new Error(formatErr(e));
    }
  };

  const register = async (email: string, password: string, name: string, role: "seeker" | "provider") => {
    try {
      const { data } = await api.post("/auth/register", { email, password, name, role });
      await setToken(data.token);
      setUser(data.user);
    } catch (e) {
      throw new Error(formatErr(e));
    }
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
