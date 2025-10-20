/**
 * Card Component - Shared UI Component
 * Phase 1: Component Simplification
 */

import React from "react";
import {
  Card as ChakraCard,
  CardHeader as ChakraCardHeader,
  CardBody as ChakraCardBody,
  CardFooter as ChakraCardFooter,
  Heading,
  Box,
} from "@chakra-ui/react";

export interface CardProps {
  children: React.ReactNode;
  variant?: "elevated" | "outline" | "filled";
  size?: "sm" | "md" | "lg";
  colorScheme?: string;
}

export function Card({ children, variant = "elevated", size = "md" }: CardProps) {
  return (
    <ChakraCard variant={variant} size={size}>
      {children}
    </ChakraCard>
  );
}

export interface CardHeaderProps {
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function CardHeader({ title, children, actions }: CardHeaderProps) {
  return (
    <ChakraCardHeader>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          {title && <Heading size="md">{title}</Heading>}
          {children}
        </Box>
        {actions && <Box>{actions}</Box>}
      </Box>
    </ChakraCardHeader>
  );
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <ChakraCardBody>{children}</ChakraCardBody>;
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return <ChakraCardFooter>{children}</ChakraCardFooter>;
}

// Export all as named exports
export default Card;

