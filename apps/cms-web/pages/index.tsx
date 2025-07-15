import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "../lib/auth";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.replace("/dashboard");
      } else {
        // User is not authenticated, redirect to sign in
        router.replace("/auth/signin");
      }
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg="gray.50"
    >
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text color="gray.600">กำลังโหลด...</Text>
      </VStack>
    </Box>
  );
}
