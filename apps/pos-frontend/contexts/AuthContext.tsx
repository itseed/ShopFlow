import React, { createContext, useContext, useEffect, useState } from "react";
import {
  POSSession,
  POSLoginCredentials,
  POSPinCredentials,
  POSAuthContextType,
} from "@shopflow/types";
import {
  authenticateUser,
  authenticateWithPin,
  getStoredSession,
  setStoredSession,
  clearStoredSession,
  validateSession,
  startAutoLogoutTimer,
} from "../lib/auth";

const AuthContext = createContext<POSAuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<POSSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSession = getStoredSession();
        if (storedSession && validateSession(storedSession)) {
          setSession(storedSession);
        } else {
          clearStoredSession();
        }
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        clearStoredSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Start auto-logout timer when session is active
  useEffect(() => {
    if (session && session.isAuthenticated) {
      const cleanup = startAutoLogoutTimer(() => {
        handleLogout();
      }, 30); // 30 minutes

      return cleanup;
    }
  }, [session]);

  const handleLogin = async (
    credentials: POSLoginCredentials
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const newSession = await authenticateUser(credentials);
      if (newSession) {
        setSession(newSession);
        setStoredSession(newSession);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithPin = async (
    credentials: POSPinCredentials
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const newSession = await authenticateWithPin(credentials);
      if (newSession) {
        setSession(newSession);
        setStoredSession(newSession);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "PIN login failed";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setError(null);
    clearStoredSession();
  };

  const value: POSAuthContextType = {
    session,
    login: handleLogin,
    loginWithPin: handleLoginWithPin,
    logout: handleLogout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
