import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

// Enhanced theme with Google Fonts and better components
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
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
    global: (props: any) => ({
      body: {
        bg: mode("gray.50", "gray.900")(props),
        color: mode("gray.900", "gray.50")(props),
        fontFamily: "body",
      },
      "*": {
        borderColor: mode("gray.200", "gray.700")(props),
      },
    }),
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
