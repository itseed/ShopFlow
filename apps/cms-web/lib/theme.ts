import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Color palette สำหรับ ShopFlow
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
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
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

// Configuration
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// Global styles
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
    "*::-webkit-scrollbar": {
      width: "8px",
    },
    "*::-webkit-scrollbar-track": {
      bg: "gray.100",
    },
    "*::-webkit-scrollbar-thumb": {
      bg: "gray.300",
      borderRadius: "4px",
    },
    "*::-webkit-scrollbar-thumb:hover": {
      bg: "gray.400",
    },
  },
};

// Typography
const fonts = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// Component customizations
const components = {
  Button: {
    baseStyle: {
      fontWeight: "medium",
      borderRadius: "lg",
    },
    variants: {
      solid: {
        bg: "brand.500",
        color: "white",
        _hover: {
          bg: "brand.600",
          _disabled: {
            bg: "brand.500",
          },
        },
        _active: {
          bg: "brand.700",
        },
      },
      outline: {
        borderColor: "brand.500",
        color: "brand.500",
        _hover: {
          bg: "brand.50",
          _disabled: {
            bg: "transparent",
          },
        },
        _active: {
          bg: "brand.100",
        },
      },
      ghost: {
        color: "brand.500",
        _hover: {
          bg: "brand.50",
          _disabled: {
            bg: "transparent",
          },
        },
        _active: {
          bg: "brand.100",
        },
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
        boxShadow: "sm",
        border: "1px solid",
        borderColor: "gray.200",
      },
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: "lg",
        borderColor: "gray.300",
        _focus: {
          borderColor: "brand.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
        },
      },
    },
    variants: {
      outline: {
        field: {
          bg: "white",
          _hover: {
            borderColor: "gray.400",
          },
          _focus: {
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          },
        },
      },
    },
    defaultProps: {
      variant: "outline",
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderColor: "gray.200",
          bg: "gray.50",
          color: "gray.600",
          fontSize: "sm",
          fontWeight: "medium",
          textTransform: "none",
          letterSpacing: "normal",
        },
        td: {
          borderColor: "gray.200",
        },
        tbody: {
          tr: {
            _hover: {
              bg: "gray.50",
            },
          },
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: "xl",
      },
    },
  },
  Alert: {
    variants: {
      subtle: {
        container: {
          borderRadius: "lg",
        },
      },
      "left-accent": {
        container: {
          borderRadius: "lg",
        },
      },
    },
  },
};

// Final theme
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
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
});

export default theme;
