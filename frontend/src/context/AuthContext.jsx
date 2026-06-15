import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout, register as apiRegister, getMe } from "../config/PralayAPI";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("pralayai_token"));
  const [loading, setLoading] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    if (token) {
      getMe()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem("pralayai_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const data = await apiLogin(email, password);
    localStorage.setItem("pralayai_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(username, email, password) {
    const data = await apiRegister(username, email, password);
    localStorage.setItem("pralayai_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await apiLogout();
    localStorage.removeItem("pralayai_token");
    setToken(null);
    setUser(null);
  }

  function updateUser(userData) {
    setUser((prev) => ({ ...prev, ...userData }));
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
