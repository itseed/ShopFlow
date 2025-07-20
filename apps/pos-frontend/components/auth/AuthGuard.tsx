import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Box } from "@chakra-ui/react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingSpinner
        fullScreen
        size="xl"
        message="Checking authentication..."
      />
    );
  }

  if (!session || !session.isAuthenticated) {
    // Redirect to login will be handled by the router
    return (
      <Box>
        {/* This component will be rendered when user is not authenticated */}
        {/* The actual redirect logic will be in the pages */}
      </Box>
    );
  }

  return <>{children}</>;
};
