import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("elearning_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { data: serverUser, isLoading: isMeLoading, error } = useGetMe({
    query: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    }
  });

  useEffect(() => {
    if (serverUser && !error) {
      setUser(serverUser);
      localStorage.setItem("elearning_user", JSON.stringify(serverUser));
    } else if (error) {
      setUser(null);
      localStorage.removeItem("elearning_user");
    }
  }, [serverUser, error]);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("elearning_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("elearning_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isMeLoading && !user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isStudent: user?.role === "student",
        login,
        logout,
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
