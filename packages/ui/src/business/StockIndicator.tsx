/**
 * StockIndicator Component - Stock Level Indicator
 * Shared between CMS and POS
 * Phase 1: Component Simplification
 */

import React from "react";
import { Badge, HStack, Text, Icon } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

export interface StockIndicatorProps {
  stock: number;
  lowStockThreshold?: number;
  showIcon?: boolean;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StockIndicator({
  stock,
  lowStockThreshold = 10,
  showIcon = true,
  showText = true,
  size = "md",
}: StockIndicatorProps) {
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= lowStockThreshold;
  const isInStock = stock > lowStockThreshold;

  const getColorScheme = () => {
    if (isOutOfStock) return "red";
    if (isLowStock) return "orange";
    return "green";
  };

  const getLabel = () => {
    if (isOutOfStock) return "Out of Stock";
    if (isLowStock) return `Low Stock (${stock})`;
    return `In Stock (${stock})`;
  };

  const getIcon = () => {
    if (isOutOfStock || isLowStock) return WarningIcon;
    return CheckCircleIcon;
  };

  if (!showText && !showIcon) {
    return (
      <Badge colorScheme={getColorScheme()} fontSize={size}>
        {stock}
      </Badge>
    );
  }

  return (
    <HStack spacing={1}>
      {showIcon && <Icon as={getIcon()} color={`${getColorScheme()}.500`} />}
      {showText && (
        <Badge colorScheme={getColorScheme()} fontSize={size}>
          {getLabel()}
        </Badge>
      )}
    </HStack>
  );
}

export default StockIndicator;

