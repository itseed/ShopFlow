import React from "react";
import {
  Box,
  Flex,
  VStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
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
                <Text
                  fontSize="lg"
                  fontWeight="medium"
                  color="gray.900"
                  fontFamily="heading"
                >
                  เกิดข้อผิดพลาด
                </Text>
                <Text fontSize="sm" color="gray.500" fontFamily="body">
                  {this.state.error?.message ||
                    "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
                </Text>
              </VStack>

              <Button
                colorScheme="blue"
                size="md"
                onClick={() => window.location.reload()}
                fontFamily="body"
              >
                รีโหลดหน้า
              </Button>

              {process.env.NODE_ENV === "development" && (
                <Box w="full" textAlign="left">
                  <Accordion allowToggle>
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            fontFamily="body"
                          >
                            รายละเอียดข้อผิดพลาด (Development)
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Code
                          display="block"
                          whiteSpace="pre-wrap"
                          fontSize="xs"
                          color="gray.500"
                          bg="gray.100"
                          p={2}
                          borderRadius="md"
                          overflowX="auto"
                          fontFamily="mono"
                        >
                          {this.state.error?.stack}
                        </Code>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
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
