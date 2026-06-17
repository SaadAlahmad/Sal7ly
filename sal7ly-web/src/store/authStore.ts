import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type AuthState } from "@/types";

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      userType: null,
      login: (token, user, userType) =>
        set({
          token,
          user,
          userType,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          userType: null,
        }),
    }),
    { name: "auth" }, // saves in localstorage under this name using persist
  ),
);

export default useAuthStore;
