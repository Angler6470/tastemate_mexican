import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("authToken");
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  useEffect(() => {
    // Check if token is still valid on app load
    if (token) {
      // You could validate the token here
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/admin/login", {
        username,
        password,
      });
      
      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
