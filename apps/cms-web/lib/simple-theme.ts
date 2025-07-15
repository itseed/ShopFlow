import { extendTheme } from "@chakra-ui/react";

// Enhanced theme with Google Fonts and better components
const theme = extendTheme({
  fonts: {
    heading: `'Kanit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    body: `'Inter', 'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    mono: `'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace`,
  },
  colors: {
    brand: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.900",
        fontFamily: "body",
      },
      "*": {
        borderColor: "gray.200",
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
      },
      variants: {
        solid: {
          fontWeight: "500",
          _hover: {
            transform: "translateY(-1px)",
            boxShadow: "lg",
          },
          transition: "all 0.2s",
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          boxShadow: "sm",
          borderRadius: "lg",
          border: "1px solid",
          borderColor: "gray.200",
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: "heading",
        fontWeight: "600",
      },
    },
  },
});

export default theme;
