import React from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

interface POSLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const POSLayout = ({
  children,
  title = "POS System",
  showHeader = true,
  showFooter = true,
}: POSLayoutProps) => {
  const headerBg = useColorModeValue("pos.primary.500", "pos.primary.600");
  const footerBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex direction="column" minH="100vh" bg="pos.background">
      {showHeader && (
        <Box
          bg={headerBg}
          color="white"
          px={6}
          py={4}
          borderBottom="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <HStack justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold">
              {title}
            </Text>
            {/* Future: Add user menu, notifications, etc. */}
          </HStack>
        </Box>
      )}

      <Box flex="1" p={4} overflow="auto" bg="pos.background">
        {children}
      </Box>

      {showFooter && (
        <Box
          bg={footerBg}
          px={6}
          py={3}
          borderTop="1px"
          borderColor={borderColor}
          color="gray.600"
        >
          <HStack justify="space-between" align="center">
            <Text fontSize="sm">
              © 2024 ShopFlow POS - Educational Use Only
            </Text>
            <Text fontSize="sm">v1.0.0</Text>
          </HStack>
        </Box>
      )}
    </Flex>
  );
};
