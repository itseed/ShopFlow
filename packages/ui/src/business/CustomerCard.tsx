/**
 * CustomerCard Component - Customer Display Card
 * Shared between CMS and POS
 * Phase 1: Component Simplification
 */

import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";

export interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    customer_loyalty_memberships?: Array<{
      points_balance: number;
      tier_name?: string;
    }>;
  };
  onSelect?: (customer: any) => void;
  showLoyalty?: boolean;
}

export function CustomerCard({
  customer,
  onSelect,
  showLoyalty = true,
}: CustomerCardProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const loyaltyMembership = customer.customer_loyalty_memberships?.[0];
  const hasLoyalty = !!loyaltyMembership;

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      cursor={onSelect ? "pointer" : "default"}
      onClick={() => onSelect?.(customer)}
      transition="all 0.2s"
      _hover={
        onSelect
          ? {
              shadow: "md",
              borderColor: "blue.400",
            }
          : {}
      }
    >
      <HStack spacing={4}>
        <Avatar name={customer.name} size="md" />

        <VStack align="stretch" spacing={1} flex={1}>
          <Text fontWeight="bold" fontSize="md">
            {customer.name}
          </Text>

          {customer.phone && (
            <Text fontSize="sm" color="gray.600">
              📱 {customer.phone}
            </Text>
          )}

          {customer.email && (
            <Text fontSize="sm" color="gray.600">
              📧 {customer.email}
            </Text>
          )}

          {showLoyalty && hasLoyalty && (
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="purple" fontSize="xs">
                {loyaltyMembership.tier_name || "Member"}
              </Badge>
              <Text fontSize="xs" color="gray.600">
                {loyaltyMembership.points_balance} points
              </Text>
            </HStack>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}

export default CustomerCard;

