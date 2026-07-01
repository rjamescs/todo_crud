import { createContext, useContext, useState } from "react";
import { registerUser, verifyUser } from "./auth.js";

const AuthContext = createContext(null);
const SESSION_KEY = "currentUser";

export function AuthProvider({ children }) {
  // Restore the logged-in user (if any) synchronously on first render.
  const [currentUser, setCurrentUser] = useState(() =>
    localStorage.getItem(SESSION_KEY)
  );

  const login = async (username, password) => {
    const name = await verifyUser(username, password);
    localStorage.setItem(SESSION_KEY, name);
    setCurrentUser(name);
  };

  const register = async (username, password) => {
    const name = await registerUser(username, password);
    localStorage.setItem(SESSION_KEY, name);
    setCurrentUser(name);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
