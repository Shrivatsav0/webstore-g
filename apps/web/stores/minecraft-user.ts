// stores/minecraft-user.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MinecraftUser {
  username: string;
  uuid: string;
  isValid: boolean;
  lastValidated: number;
}

interface MinecraftUserState {
  user: MinecraftUser | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: MinecraftUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useMinecraftUserStore = create<MinecraftUserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearUser: () => set({ user: null, error: null }),
    }),
    {
      name: "minecraft-user-storage",
    }
  )
);
