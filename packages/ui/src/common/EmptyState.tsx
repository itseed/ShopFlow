/**
 * EmptyState Component - Empty State Display
 * Phase 1: Component Simplification
 */

import React from "react";
import { Box, VStack, Text, Button, Icon } from "@chakra-ui/react";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  const IconComponent = icon || SearchIcon;

  return (
    <Box textAlign="center" py={10}>
      <VStack spacing={4}>
        <Icon as={IconComponent} boxSize={12} color="gray.400" />

        <VStack spacing={2}>
          <Text fontSize="xl" fontWeight="semibold" color="gray.700">
            {title}
          </Text>

          {description && (
            <Text fontSize="md" color="gray.500" maxW="md">
              {description}
            </Text>
          )}
        </VStack>

        {onAction && actionLabel && (
          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
            onClick={onAction}
            mt={2}
          >
            {actionLabel}
          </Button>
        )}

        {children}
      </VStack>
    </Box>
  );
}

export default EmptyState;

