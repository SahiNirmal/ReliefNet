import { createContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

// Provides the logged-in user (and role) to every component via useContext,
// instead of passing auth state down through props at every level.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const STORAGE_KEY = "reliefnet_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first load. Real JWT verification against the
  // backend is added in Experiment 6 — for now this only reads what
  // login()/register() below wrote to memory during this session.
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Both now call the real Experiment 4 REST API instead of faking a
  // user object locally. The Mongo _id that comes back is what requests
  // and donations reference. Experiment 6 swaps the plaintext password
  // check here for hashed passwords + a JWT returned on success.
  const login = useCallback(async ({ email, password }) => {
    const loggedInUser = await api.post("/users/login", { email, password });
    setUser(loggedInUser);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const newUser = await api.post("/users/register", payload);
    setUser(newUser);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
