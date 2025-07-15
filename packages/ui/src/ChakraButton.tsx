import React from "react";
import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";

export interface ButtonProps extends ChakraButtonProps {
  label?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  children,
  ...props
}) => {
  return <ChakraButton {...props}>{label || children}</ChakraButton>;
};

// Export Chakra Button directly for advanced usage
export { Button as ChakraButton } from "@chakra-ui/react";
