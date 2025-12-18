import React from "react";
import {
  Box,
  Flex,
  VStack,
  Text,
  Button,
  Icon,
} from "@chakra-ui/react";
import { FiAlertTriangle } from "react-icons/fi";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
          <Box
            maxW="md"
            w="full"
            bg="white"
            borderRadius="lg"
            shadow="lg"
            p={6}
          >
            <VStack spacing={4} textAlign="center">
              <Flex
                align="center"
                justify="center"
                w={12}
                h={12}
                borderRadius="full"
                bg="red.100"
              >
                <Icon as={FiAlertTriangle} w={6} h={6} color="red.600" />
              </Flex>

              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="medium" color="gray.900">
                  เกิดข้อผิดพลาด
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {this.state.error?.message ||
                    "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
                </Text>
              </VStack>

              <Button
                colorScheme="blue"
                size="md"
                onClick={() => window.location.reload()}
              >
                รีโหลดหน้า
              </Button>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <Box
                  w="full"
                  p={4}
                  bg="gray.100"
                  borderRadius="md"
                  fontSize="xs"
                  fontFamily="mono"
                  overflowX="auto"
                >
                  <Text fontWeight="bold" mb={2}>
                    Error Details:
                  </Text>
                  <Text whiteSpace="pre-wrap">{this.state.error.stack}</Text>
                </Box>
              )}
            </VStack>
          </Box>
        </Flex>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

