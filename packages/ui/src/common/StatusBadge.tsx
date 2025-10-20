/**
 * StatusBadge Component - Status Indicators
 * Phase 1: Component Simplification
 */

import React from "react";
import { Badge, BadgeProps } from "@chakra-ui/react";

export interface StatusBadgeProps extends Omit<BadgeProps, "colorScheme"> {
  status:
    | "active"
    | "inactive"
    | "pending"
    | "completed"
    | "cancelled"
    | "paid"
    | "unpaid"
    | "refunded"
    | "success"
    | "error"
    | "warning"
    | "info";
  text?: string;
}

const statusConfig: Record<
  StatusBadgeProps["status"],
  { colorScheme: string; label: string }
> = {
  active: { colorScheme: "green", label: "Active" },
  inactive: { colorScheme: "gray", label: "Inactive" },
  pending: { colorScheme: "yellow", label: "Pending" },
  completed: { colorScheme: "green", label: "Completed" },
  cancelled: { colorScheme: "red", label: "Cancelled" },
  paid: { colorScheme: "green", label: "Paid" },
  unpaid: { colorScheme: "orange", label: "Unpaid" },
  refunded: { colorScheme: "purple", label: "Refunded" },
  success: { colorScheme: "green", label: "Success" },
  error: { colorScheme: "red", label: "Error" },
  warning: { colorScheme: "orange", label: "Warning" },
  info: { colorScheme: "blue", label: "Info" },
};

export function StatusBadge({ status, text, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge colorScheme={config.colorScheme} {...props}>
      {text || config.label}
    </Badge>
  );
}

export default StatusBadge;

