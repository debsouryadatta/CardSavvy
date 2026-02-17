import { createContext, useContext, useMemo, useState } from "react";

type AuthValue = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("cardsavvy_token"));

  const setToken = (value: string | null) => {
    setTokenState(value);
    if (value) {
      localStorage.setItem("cardsavvy_token", value);
    } else {
      localStorage.removeItem("cardsavvy_token");
    }
  };

  const logout = () => setToken(null);

  const value = useMemo(() => ({ token, setToken, logout }), [token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
