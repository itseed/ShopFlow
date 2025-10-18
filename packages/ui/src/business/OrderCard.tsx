/**
 * OrderCard Component - Order Display Card
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
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { StatusBadge } from "../common/StatusBadge";

export interface OrderCardProps {
  order: {
    id: string;
    order_number?: string;
    total_amount: number;
    status: string;
    payment_status?: string;
    created_at: string;
    customer?: {
      name: string;
      phone?: string;
    };
    order_items?: Array<{
      quantity: number;
    }>;
  };
  onSelect?: (order: any) => void;
  showCustomer?: boolean;
}

export function OrderCard({
  order,
  onSelect,
  showCustomer = true,
}: OrderCardProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const totalItems =
    order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      cursor={onSelect ? "pointer" : "default"}
      onClick={() => onSelect?.(order)}
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
      <VStack align="stretch" spacing={3}>
        {/* Header */}
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg">
            {order.order_number || `#${order.id.slice(0, 8)}`}
          </Text>
          <StatusBadge status={order.status as any} />
        </HStack>

        <Divider />

        {/* Customer Info */}
        {showCustomer && order.customer && (
          <Box>
            <Text fontSize="sm" color="gray.600">
              Customer
            </Text>
            <Text fontWeight="medium">{order.customer.name}</Text>
            {order.customer.phone && (
              <Text fontSize="sm" color="gray.500">
                {order.customer.phone}
              </Text>
            )}
          </Box>
        )}

        {/* Order Details */}
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" color="gray.600">
              Items
            </Text>
            <Text fontWeight="medium">{totalItems}</Text>
          </VStack>

          <VStack align="end" spacing={0}>
            <Text fontSize="sm" color="gray.600">
              Total
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              ฿{order.total_amount.toLocaleString()}
            </Text>
          </VStack>
        </HStack>

        {/* Payment Status */}
        {order.payment_status && (
          <HStack>
            <Text fontSize="sm" color="gray.600">
              Payment:
            </Text>
            <StatusBadge status={order.payment_status as any} size="sm" />
          </HStack>
        )}

        {/* Date */}
        <Text fontSize="xs" color="gray.500">
          {formatDate(order.created_at)}
        </Text>
      </VStack>
    </Box>
  );
}

export default OrderCard;

