import React from "react";
import {
  Spinner,
  Flex,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({
  size = "md",
  message = "Loading...",
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const bg = useColorModeValue(
    "rgba(255, 255, 255, 0.8)",
    "rgba(26, 32, 44, 0.8)"
  );
  const spinnerColor = useColorModeValue("pos.primary.500", "pos.primary.300");

  const content = (
    <VStack spacing={4}>
      <Spinner
        size={size}
        color={spinnerColor}
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
      />
      {message && (
        <Text fontSize="sm" color="gray.600" textAlign="center">
          {message}
        </Text>
      )}
    </VStack>
  );

  if (fullScreen) {
    return (
      <Flex
        position="fixed"
        top={0}
        left={0}
        width="100vw"
        height="100vh"
        bg={bg}
        justify="center"
        align="center"
        zIndex={9999}
        backdropFilter="blur(2px)"
      >
        {content}
      </Flex>
    );
  }

  return (
    <Flex justify="center" align="center" py={8}>
      {content}
    </Flex>
  );
};
