import React from "react";
import {
  Button,
  ButtonProps,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";

interface TouchButtonProps extends Omit<ButtonProps, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  loading?: boolean;
  touchOptimized?: boolean;
}

export const TouchButton = ({
  children,
  variant = "primary",
  loading = false,
  touchOptimized = true,
  disabled,
  ...props
}: TouchButtonProps) => {
  const getColorScheme = () => {
    switch (variant) {
      case "primary":
        return "pos.primary";
      case "secondary":
        return "gray";
      case "success":
        return "pos.success";
      case "warning":
        return "pos.warning";
      case "danger":
        return "pos.danger";
      default:
        return "pos.primary";
    }
  };

  const minHeight = touchOptimized ? "44px" : "32px";
  const minWidth = touchOptimized ? "44px" : "auto";
  const fontSize = touchOptimized ? "md" : "sm";
  const px = touchOptimized ? 6 : 4;
  const py = touchOptimized ? 3 : 2;

  return (
    <Button
      colorScheme={getColorScheme()}
      minH={minHeight}
      minW={minWidth}
      fontSize={fontSize}
      px={px}
      py={py}
      disabled={disabled || loading}
      _hover={{
        transform: touchOptimized ? "translateY(-1px)" : undefined,
        shadow: touchOptimized ? "md" : undefined,
      }}
      _active={{
        transform: touchOptimized ? "translateY(0)" : undefined,
      }}
      transition="all 0.2s"
      {...props}
    >
      {loading ? <Spinner size="sm" mr={children ? 2 : 0} /> : null}
      {children}
    </Button>
  );
};
