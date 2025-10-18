/**
 * PageHeader Component - Standard Page Header
 * Phase 1: Component Simplification
 */

import React from "react";
import { Box, Heading, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Box mb={6}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          spacing={2}
          separator={<ChevronRightIcon color="gray.500" />}
          mb={2}
          fontSize="sm"
        >
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={index}>
              {crumb.href ? (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              ) : (
                <Text color="gray.600">{crumb.label}</Text>
              )}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}

      <HStack justify="space-between" align="center">
        <Heading size="lg">{title}</Heading>
        {actions && <Box>{actions}</Box>}
      </HStack>
    </Box>
  );
}

export default PageHeader;

