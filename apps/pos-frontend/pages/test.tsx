import {
  VStack,
  Heading,
  Text,
  HStack,
  Box,
  SimpleGrid,
} from "@chakra-ui/react";
import { POSLayout, TouchButton, POSCard, LoadingSpinner } from "../components";
import { useState } from "react";

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const handleTest = (test: string) => {
    console.log(`Testing: ${test}`);
    if (test === "loading") {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    } else if (test === "spinner") {
      setShowSpinner(true);
      setTimeout(() => setShowSpinner(false), 3000);
    }
  };

  return (
    <POSLayout title="Component Test Page" showFooter={false}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2} color="pos.primary.600">
            POS Component Testing
          </Heading>
          <Text color="gray.600">
            This page tests all POS components to ensure they work correctly.
          </Text>
        </Box>

        {/* TouchButton Tests */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            TouchButton Components
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
            <TouchButton
              variant="primary"
              onClick={() => handleTest("primary")}
              loading={loading}
            >
              Primary
            </TouchButton>
            <TouchButton
              variant="secondary"
              onClick={() => handleTest("secondary")}
            >
              Secondary
            </TouchButton>
            <TouchButton
              variant="success"
              onClick={() => handleTest("success")}
            >
              Success
            </TouchButton>
            <TouchButton
              variant="warning"
              onClick={() => handleTest("warning")}
            >
              Warning
            </TouchButton>
            <TouchButton variant="danger" onClick={() => handleTest("danger")}>
              Danger
            </TouchButton>
          </SimpleGrid>
        </Box>

        {/* POSCard Tests */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            POSCard Components
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <POSCard variant="default">
              <VStack spacing={2}>
                <Heading size="sm">Default Card</Heading>
                <Text fontSize="sm" color="gray.600">
                  This is a default card with subtle shadow and border.
                </Text>
              </VStack>
            </POSCard>
            <POSCard variant="elevated">
              <VStack spacing={2}>
                <Heading size="sm">Elevated Card</Heading>
                <Text fontSize="sm" color="gray.600">
                  This is an elevated card with stronger shadow.
                </Text>
              </VStack>
            </POSCard>
            <POSCard variant="outlined">
              <VStack spacing={2}>
                <Heading size="sm">Outlined Card</Heading>
                <Text fontSize="sm" color="gray.600">
                  This is an outlined card with border only.
                </Text>
              </VStack>
            </POSCard>
          </SimpleGrid>
        </Box>

        {/* Interactive POSCard Test */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            Interactive POSCard
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <POSCard
              variant="elevated"
              interactive
              onClick={() => handleTest("card1")}
            >
              <VStack spacing={3}>
                <Heading size="sm" color="pos.primary.600">
                  🎯 Interactive Card
                </Heading>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Click me to see hover and click effects!
                </Text>
              </VStack>
            </POSCard>
            <POSCard
              variant="outlined"
              interactive
              onClick={() => handleTest("card2")}
            >
              <VStack spacing={3}>
                <Heading size="sm" color="pos.success.600">
                  ⚡ Another Interactive Card
                </Heading>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  I also respond to touch interactions!
                </Text>
              </VStack>
            </POSCard>
          </SimpleGrid>
        </Box>

        {/* LoadingSpinner Tests */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            LoadingSpinner Components
          </Heading>
          <HStack spacing={4} wrap="wrap">
            <TouchButton
              variant="primary"
              onClick={() => handleTest("loading")}
              loading={loading}
            >
              Test Button Loading
            </TouchButton>
            <TouchButton
              variant="secondary"
              onClick={() => handleTest("spinner")}
            >
              Test Spinner Overlay
            </TouchButton>
          </HStack>

          {/* Regular spinner */}
          <Box mt={4}>
            <LoadingSpinner size="md" message="Testing regular spinner..." />
          </Box>
        </Box>

        {/* Theme Colors Test */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            Theme Colors
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box
              bg="pos.primary.500"
              p={4}
              borderRadius="md"
              color="white"
              textAlign="center"
            >
              Primary
            </Box>
            <Box
              bg="pos.secondary.500"
              p={4}
              borderRadius="md"
              color="white"
              textAlign="center"
            >
              Secondary
            </Box>
            <Box
              bg="pos.success.500"
              p={4}
              borderRadius="md"
              color="white"
              textAlign="center"
            >
              Success
            </Box>
            <Box
              bg="pos.warning.500"
              p={4}
              borderRadius="md"
              color="white"
              textAlign="center"
            >
              Warning
            </Box>
            <Box
              bg="pos.danger.500"
              p={4}
              borderRadius="md"
              color="white"
              textAlign="center"
            >
              Danger
            </Box>
            <Box
              bg="pos.background"
              p={4}
              borderRadius="md"
              border="1px"
              borderColor="gray.200"
              textAlign="center"
            >
              Background
            </Box>
          </SimpleGrid>
        </Box>
      </VStack>

      {/* Full Screen Spinner */}
      {showSpinner && (
        <LoadingSpinner
          fullScreen
          size="xl"
          message="Testing full screen spinner..."
        />
      )}
    </POSLayout>
  );
}
