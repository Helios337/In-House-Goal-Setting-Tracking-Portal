import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Role } from "@/types/user";

interface AuthState {
  user: User | null;
  role: Role | null; // The primary active role
  jwt: string | null;
  
  // Actions
  setAuth: (user: User, jwt: string) => void;
  switchRole: (role: Role) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      jwt: null,

      setAuth: (user, jwt) => set({ 
        user, 
        jwt, 
        // Default to the first role assigned in Entra ID, fallback to Employee
        role: user.roles.length > 0 ? user.roles[0] : "Employee" 
      }),

      switchRole: (role) => set({ role }),

      clearAuth: () => set({ user: null, role: null, jwt: null }),

      isAuthenticated: () => !!get().jwt,
    }),
    {
      name: "auth-storage", // Persist to localStorage for fast hydration
      partialize: (state) => ({ role: state.role }), // Only persist the active role preference
    }
  )
);
