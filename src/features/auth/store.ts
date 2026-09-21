import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { User, UserRole } from "@/types/models";
import { authApi, setAuthTokenGetter } from "@/services/api-client";

const AUTH_TOKEN_KEY = "padhaikarow_jwt_token";
const AUTH_USER_KEY = "padhaikarow_user_data";

async function saveStorage(key: string, value: string) {
  if (Platform.OS === "web") {
    try { localStorage.setItem(key, value); } catch {}
  } else {
    try { await SecureStore.setItemAsync(key, value); } catch {}
  }
}

async function getStorage(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try { return localStorage.getItem(key); } catch { return null; }
  } else {
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  }
}

async function deleteStorage(key: string) {
  if (Platform.OS === "web") {
    try { localStorage.removeItem(key); } catch {}
  } else {
    try { await SecureStore.deleteItemAsync(key); } catch {}
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedRole: UserRole | null;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSelectedRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;

  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: "student" | "partner"; inviteCode?: string }) => Promise<User>;
  loginWithSession: (user: User, token: string) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  logout: () => Promise<void>;

  isStudent: () => boolean;
  isPartner: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  setAuthTokenGetter(() => get().token);

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    selectedRole: null,

    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setSelectedRole: (role) => set({ selectedRole: role }),
    setLoading: (isLoading) => set({ isLoading }),

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      try {
        const res = await authApi.login({ email, password });
        const user = res.user as User;
        const token = res.token;

        await saveStorage(AUTH_TOKEN_KEY, token);
        await saveStorage(AUTH_USER_KEY, JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          selectedRole: user.role,
        });

        return user;
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    register: async (data) => {
      set({ isLoading: true });
      try {
        const res = await authApi.register(data);
        const user = res.user as User;
        const token = res.token;

        await saveStorage(AUTH_TOKEN_KEY, token);
        await saveStorage(AUTH_USER_KEY, JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          selectedRole: user.role,
        });

        return user;
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    loginWithSession: async (user: User, token: string) => {
      await saveStorage(AUTH_TOKEN_KEY, token);
      await saveStorage(AUTH_USER_KEY, JSON.stringify(user));
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        selectedRole: user.role,
      });
    },

    restoreSession: async () => {
      set({ isLoading: true });
      try {
        const token = await getStorage(AUTH_TOKEN_KEY);
        const savedUserStr = await getStorage(AUTH_USER_KEY);

        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null, token: null });
          return false;
        }

        try {
          const res = await authApi.me(token);
          const freshUser = res.user as User;
          await saveStorage(AUTH_USER_KEY, JSON.stringify(freshUser));
          set({
            user: freshUser,
            token,
            isAuthenticated: true,
            isLoading: false,
            selectedRole: freshUser.role,
          });
          return true;
        } catch {
          if (savedUserStr) {
            const cachedUser = JSON.parse(savedUserStr) as User;
            set({
              user: cachedUser,
              token,
              isAuthenticated: true,
              isLoading: false,
              selectedRole: cachedUser.role,
            });
            return true;
          }
          await deleteStorage(AUTH_TOKEN_KEY);
          await deleteStorage(AUTH_USER_KEY);
          set({ isLoading: false, isAuthenticated: false, user: null, token: null });
          return false;
        }
      } catch {
        set({ isLoading: false });
        return false;
      }
    },

    logout: async () => {
      await deleteStorage(AUTH_TOKEN_KEY);
      await deleteStorage(AUTH_USER_KEY);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        selectedRole: null,
      });
    },

    isStudent: () => get().user?.role === "student",
    isPartner: () => get().user?.role === "partner",
  };
});
