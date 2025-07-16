import {
  VStack,
  Heading,
  Text,
  HStack,
  Box,
  SimpleGrid,
} from "@chakra-ui/react";
import { POSLayout, TouchButton, POSCard, LoadingSpinner } from "../components";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const { session, logout, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && (!session || !session.isAuthenticated)) {
      router.push("/login");
    }
  }, [session, isLoading, router]);

  const handleQuickAction = (action: string) => {
    setLoading(true);
    console.log(`Quick action: ${action}`);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen size="xl" message="Loading POS system..." />
    );
  }

  if (!session) {
    return (
      <LoadingSpinner fullScreen size="xl" message="Redirecting to login..." />
    );
  }

  return (
    <POSLayout>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="primary.600">
              Welcome back, {session.user.firstName}!
            </Heading>
            <Text color="gray.600">
              {session.branch.name} • {new Date().toLocaleDateString()}
            </Text>
          </VStack>
          <TouchButton
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            isLoading={loading}
          >
            Logout
          </TouchButton>
        </HStack>

        {/* Quick Action Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <POSCard variant="elevated" interactive>
          <VStack spacing={4}>
            <Heading size="md" color="primary.600">
              🛒 Sales Terminal
            </Heading>
            <Text textAlign="center" color="gray.600">
              Start selling products and manage transactions
            </Text>
            <TouchButton
              variant="primary"
              size="lg"
              width="full"
              onClick={() => router.push("/sales")}
            >
              Start Sales
            </TouchButton>
          </VStack>
        </POSCard>

        <POSCard variant="elevated" interactive>
          <VStack spacing={4}>
            <Heading size="md" color="teal.600">
              🛍️ Products
            </Heading>
            <Text textAlign="center" color="gray.600">
              Manage product listings and pricing
            </Text>
            <TouchButton
              variant="primary"
              size="lg"
              width="full"
              onClick={() => router.push("/products")}
            >
              Manage Products
            </TouchButton>
          </VStack>
        </POSCard>

          <POSCard variant="elevated" interactive>
            <VStack spacing={4}>
              <Heading size="md" color="blue.600">
                📦 Inventory
              </Heading>
              <Text textAlign="center" color="gray.600">
                View and manage product inventory and stock levels
              </Text>
              <TouchButton
                variant="primary"
                size="lg"
                width="full"
                onClick={() => router.push("/inventory")}
              >
                View Inventory
              </TouchButton>
            </VStack>
          </POSCard>

          <POSCard variant="elevated" interactive>
            <VStack spacing={4}>
              <Heading size="md" color="orange.600">
                📊 Reports
              </Heading>
              <Text textAlign="center" color="gray.600">
                Access sales reports and analytics dashboard
              </Text>
              <TouchButton
                variant="warning"
                size="lg"
                width="full"
                onClick={() => router.push("/reports")}
              >
                View Reports
              </TouchButton>
            </VStack>
          </POSCard>

          <POSCard variant="elevated" interactive>
            <VStack spacing={4}>
              <Heading size="md" color="purple.600">
                👥 Customers
              </Heading>
              <Text textAlign="center" color="gray.600">
                Manage customer information and purchase history
              </Text>
              <TouchButton
                variant="secondary"
                size="lg"
                width="full"
                onClick={() => router.push("/customers")}
              >
                Manage Customers
              </TouchButton>
            </VStack>
          </POSCard>

          <POSCard variant="elevated" interactive>
            <VStack spacing={4}>
              <Heading size="md" color="green.600">
                ⚙️ Settings
              </Heading>
              <Text textAlign="center" color="gray.600">
                Configure system settings and preferences
              </Text>
              <TouchButton
                variant="warning"
                size="lg"
                width="full"
                onClick={() => router.push("/settings")}
              >
                System Settings
              </TouchButton>
            </VStack>
          </POSCard>

          <POSCard variant="elevated" interactive>
            <VStack spacing={4}>
              <Heading size="md" color="gray.600">
                🔧 Maintenance
              </Heading>
              <Text textAlign="center" color="gray.600">
                System maintenance and troubleshooting tools
              </Text>
              <TouchButton
                variant="secondary"
                size="lg"
                width="full"
                onClick={() => handleQuickAction("maintenance")}
              >
                Maintenance
              </TouchButton>
            </VStack>
          </POSCard>
        </SimpleGrid>

        {/* Quick Stats */}
        <Box>
          <Heading size="md" mb={4} color="primary.600">
            Quick Stats
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <POSCard variant="outlined">
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                  $2,543.75
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Today's Sales
                </Text>
              </VStack>
            </POSCard>
            <POSCard variant="outlined">
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  47
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Transactions
                </Text>
              </VStack>
            </POSCard>
            <POSCard variant="outlined">
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  12
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Low Stock Items
                </Text>
              </VStack>
            </POSCard>
            <POSCard variant="outlined">
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  156
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Total Products
                </Text>
              </VStack>
            </POSCard>
          </SimpleGrid>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Heading size="md" mb={4} color="primary.600">
            Recent Activity
          </Heading>
          <POSCard variant="outlined">
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm">Last sale: Coca Cola - 330ml</Text>
                <Text fontSize="sm" color="gray.500">
                  2 minutes ago
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">Inventory updated: Fresh Bread</Text>
                <Text fontSize="sm" color="gray.500">
                  15 minutes ago
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">New customer registered</Text>
                <Text fontSize="sm" color="gray.500">
                  1 hour ago
                </Text>
              </HStack>
            </VStack>
          </POSCard>
        </Box>
      </VStack>
    </POSLayout>
  );
}
