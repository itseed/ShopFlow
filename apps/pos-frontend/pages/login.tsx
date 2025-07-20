import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { VStack, Box, useColorModeValue } from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";
import { LoginForm } from "../components/auth/LoginForm";
import { PinEntry } from "../components/auth/PinEntry";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState<"password" | "pin">("password");
  const { session, login, loginWithPin, isLoading, error } = useAuth();
  const router = useRouter();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (session?.isAuthenticated) {
      router.push("/");
    }
  }, [session, router]);

  const handleLogin = async (credentials: any) => {
    const success = await login(credentials);
    if (success) {
      router.push("/");
    }
    return success;
  };

  const handlePinLogin = async (credentials: any) => {
    const success = await loginWithPin(credentials);
    if (success) {
      router.push("/");
    }
    return success;
  };

  const handleSwitchMode = () => {
    setLoginMode(loginMode === "password" ? "pin" : "password");
  };

  if (session?.isAuthenticated) {
    return (
      <LoadingSpinner
        fullScreen
        size="xl"
        message="Redirecting to dashboard..."
      />
    );
  }

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      backgroundImage={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <VStack spacing={8} width="100%" maxWidth="500px">
        <Box>
          <VStack spacing={3} textAlign="center">
            <Box
              fontSize="4xl"
              fontWeight="bold"
              bgGradient="linear(to-r, white, gray.200)"
              bgClip="text"
              textShadow="0 2px 4px rgba(0,0,0,0.1)"
            >
              🏪 ShopFlow POS
            </Box>
            <Box
              fontSize="lg"
              color="whiteAlpha.900"
              textShadow="0 1px 2px rgba(0,0,0,0.1)"
            >
              Point of Sale System
            </Box>
          </VStack>
        </Box>

        <Box width="100%">
          {loginMode === "password" ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToPin={handleSwitchMode}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <PinEntry
              onPinLogin={handlePinLogin}
              onSwitchToLogin={handleSwitchMode}
              isLoading={isLoading}
              error={error}
            />
          )}
        </Box>
      </VStack>
    </Box>
  );
}
