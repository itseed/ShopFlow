import React from "react";
import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react";

interface POSCardProps extends Omit<BoxProps, "children"> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  interactive?: boolean;
}

export const POSCard = ({
  children,
  variant = "default",
  interactive = false,
  ...props
}: POSCardProps) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          shadow: "md",
          border: "none",
        };
      case "outlined":
        return {
          border: "1px solid",
          borderColor,
          shadow: "none",
        };
      default:
        return {
          border: "1px solid",
          borderColor,
          shadow: "sm",
        };
    }
  };

  const interactiveStyles = interactive
    ? {
        cursor: "pointer",
        _hover: {
          bg: hoverBg,
          transform: "translateY(-2px)",
          shadow: "lg",
        },
        _active: {
          transform: "translateY(0)",
        },
        transition: "all 0.2s",
      }
    : {};

  return (
    <Box
      bg={bg}
      borderRadius="md"
      p={4}
      {...getVariantStyles()}
      {...interactiveStyles}
      {...props}
    >
      {children}
    </Box>
  );
};
