import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 20000,
});

const TOKEN_KEY = "lv_auth_token";
const REMEMBER_KEY = "lv_remembered_login";

const memStore: Record<string, string | null> = {};

async function _set(key: string, val: string | null) {
  if (val === null) {
    if (Platform.OS === "web") {
      try { localStorage.removeItem(key); } catch {}
      memStore[key] = null;
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } else {
    if (Platform.OS === "web") {
      try { localStorage.setItem(key, val); } catch {}
      memStore[key] = val;
    } else {
      await SecureStore.setItemAsync(key, val);
    }
  }
}
async function _get(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try { return localStorage.getItem(key); } catch { return memStore[key] ?? null; }
  }
  return await SecureStore.getItemAsync(key);
}

export async function setToken(token: string | null) { await _set(TOKEN_KEY, token); }
export async function getToken(): Promise<string | null> { return _get(TOKEN_KEY); }

export type RememberedLogin = { email: string; password: string };
export async function saveRememberedLogin(payload: RememberedLogin) {
  await _set(REMEMBER_KEY, JSON.stringify(payload));
}
export async function getRememberedLogin(): Promise<RememberedLogin | null> {
  const raw = await _get(REMEMBER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export async function clearRememberedLogin() { await _set(REMEMBER_KEY, null); }

api.interceptors.request.use(async (config) => {
  const t = await getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export function formatErr(e: any): string {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x: any) => x?.msg || JSON.stringify(x)).join(", ");
  return e?.message || "Something went wrong";
}
