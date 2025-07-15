import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Same theme as CMS but with POS-specific adjustments
const colors = {
  brand: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Primary blue
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  // POS specific colors
  pos: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // POS primary
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
};

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// POS-optimized styles
const styles = {
  global: {
    body: {
      bg: "gray.50",
      color: "gray.800",
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    "*": {
      borderColor: "gray.200",
    },
  },
};

const fonts = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// POS-specific component customizations
const components = {
  Button: {
    baseStyle: {
      fontWeight: "medium",
      borderRadius: "xl",
    },
    variants: {
      solid: {
        bg: "pos.500",
        color: "white",
        _hover: {
          bg: "pos.600",
          _disabled: {
            bg: "pos.500",
          },
        },
        _active: {
          bg: "pos.700",
        },
      },
      // Large buttons for POS interface
      "pos-large": {
        bg: "pos.500",
        color: "white",
        size: "lg",
        fontSize: "lg",
        py: 8,
        px: 6,
        borderRadius: "xl",
        _hover: {
          bg: "pos.600",
        },
      },
      "pos-success": {
        bg: "success.500",
        color: "white",
        _hover: {
          bg: "success.600",
        },
      },
      "pos-warning": {
        bg: "warning.500",
        color: "white",
        _hover: {
          bg: "warning.600",
        },
      },
    },
    sizes: {
      "pos-xl": {
        h: 16,
        minW: 16,
        fontSize: "xl",
        px: 8,
      },
    },
    defaultProps: {
      variant: "solid",
      size: "md",
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: "white",
        borderRadius: "xl",
        boxShadow: "lg",
        border: "1px solid",
        borderColor: "gray.200",
      },
    },
    variants: {
      "pos-item": {
        container: {
          cursor: "pointer",
          transition: "all 0.2s",
          _hover: {
            transform: "translateY(-2px)",
            boxShadow: "xl",
            borderColor: "pos.300",
          },
          _active: {
            transform: "translateY(0)",
            boxShadow: "lg",
          },
        },
      },
    },
  },
  NumberInput: {
    variants: {
      "pos-large": {
        field: {
          fontSize: "xl",
          textAlign: "center",
          fontWeight: "bold",
        },
      },
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  space: {
    "4.5": "1.125rem",
    "5.5": "1.375rem",
  },
  sizes: {
    "4.5": "1.125rem",
    "5.5": "1.375rem",
  },
  radii: {
    xl: "0.75rem",
    "2xl": "1rem",
  },
});

export default theme;
