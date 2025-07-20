import { extendTheme } from "@chakra-ui/react";

// POS-specific theme optimized for touch interfaces
const posTheme = extendTheme({
  fonts: {
    heading: 'Inter, Kanit, sans-serif',
    body: 'Inter, Kanit, sans-serif',
  },
  colors: {
    // Primary POS colors - comfortable blues and greens
    brand: {
      50: "#e6f3ff",
      100: "#b3d9ff",
      200: "#80bfff",
      300: "#4da6ff",
      400: "#1a8cff",
      500: "#0066cc", // Primary blue
      600: "#0052a3",
      700: "#003d7a",
      800: "#002952",
      900: "#001429",
    },
    // Success colors for completed transactions
    success: {
      50: "#e6f7ed",
      100: "#b3e5cc",
      200: "#80d4aa",
      300: "#4dc288",
      400: "#1ab066",
      500: "#0f8a5f", // Success green
      600: "#0c6e4c",
      700: "#095339",
      800: "#063826",
      900: "#031c13",
    },
    // Warning colors for low stock, etc.
    warning: {
      50: "#fff8e6",
      100: "#ffecb3",
      200: "#ffe080",
      300: "#ffd44d",
      400: "#ffc81a",
      500: "#e6b800", // Warning orange
      600: "#b39300",
      700: "#806e00",
      800: "#4d4900",
      900: "#1a2400",
    },
    // Error colors for failed transactions
    error: {
      50: "#ffe6e6",
      100: "#ffb3b3",
      200: "#ff8080",
      300: "#ff4d4d",
      400: "#ff1a1a",
      500: "#e60000", // Error red
      600: "#b30000",
      700: "#800000",
      800: "#4d0000",
      900: "#1a0000",
    },
    // Neutral colors for backgrounds and text
    gray: {
      50: "#f8f9fa",
      100: "#e9ecef",
      200: "#dee2e6",
      300: "#ced4da",
      400: "#adb5bd",
      500: "#6c757d",
      600: "#495057",
      700: "#343a40",
      800: "#212529",
      900: "#121416",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
        fontSize: "16px", // Larger base font for readability
        lineHeight: "1.5",
      },
      // Ensure touch targets are large enough
      button: {
        minH: "44px", // Minimum 44px for touch targets
        minW: "44px",
      },
    },
  },
  components: {
    // Button component optimized for POS
    Button: {
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "lg",
        transition: "all 0.2s",
        _focus: {
          boxShadow: "0 0 0 3px rgba(0, 102, 204, 0.3)",
        },
        _active: {
          transform: "scale(0.95)",
        },
      },
      sizes: {
        // Touch-friendly sizes
        sm: {
          h: "44px",
          minW: "44px",
          fontSize: "14px",
          px: 4,
        },
        md: {
          h: "48px",
          minW: "48px",
          fontSize: "16px",
          px: 6,
        },
        lg: {
          h: "56px",
          minW: "56px",
          fontSize: "18px",
          px: 8,
        },
        xl: {
          h: "64px",
          minW: "64px",
          fontSize: "20px",
          px: 10,
        },
        // Special POS sizes
        pos: {
          h: "80px",
          minW: "80px",
          fontSize: "18px",
          px: 6,
        },
        "pos-wide": {
          h: "64px",
          minW: "120px",
          fontSize: "16px",
          px: 8,
        },
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
        },
        success: {
          bg: "success.500",
          color: "white",
          _hover: {
            bg: "success.600",
            _disabled: {
              bg: "success.500",
            },
          },
        },
        warning: {
          bg: "warning.500",
          color: "white",
          _hover: {
            bg: "warning.600",
            _disabled: {
              bg: "warning.500",
            },
          },
        },
        error: {
          bg: "error.500",
          color: "white",
          _hover: {
            bg: "error.600",
            _disabled: {
              bg: "error.500",
            },
          },
        },
        ghost: {
          bg: "transparent",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
          },
        },
        outline: {
          border: "2px solid",
          borderColor: "brand.500",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
          },
        },
      },
      defaultProps: {
        size: "md",
        variant: "solid",
      },
    },
    // Input component for POS
    Input: {
      baseStyle: {
        field: {
          fontSize: "16px",
          _focus: {
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px rgba(0, 102, 204, 0.3)",
          },
        },
      },
      sizes: {
        sm: {
          field: {
            h: "44px",
            fontSize: "14px",
          },
        },
        md: {
          field: {
            h: "48px",
            fontSize: "16px",
          },
        },
        lg: {
          field: {
            h: "56px",
            fontSize: "18px",
          },
        },
      },
      defaultProps: {
        size: "md",
      },
    },
    // Card component for POS
    Card: {
      baseStyle: {
        container: {
          borderRadius: "lg",
          boxShadow: "sm",
          border: "1px solid",
          borderColor: "gray.200",
          _hover: {
            boxShadow: "md",
          },
        },
      },
      variants: {
        elevated: {
          container: {
            boxShadow: "lg",
          },
        },
        interactive: {
          container: {
            cursor: "pointer",
            transition: "all 0.2s",
            _hover: {
              boxShadow: "lg",
              transform: "translateY(-2px)",
            },
            _active: {
              transform: "translateY(0)",
            },
          },
        },
      },
    },
    // Modal component for POS
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "lg",
          boxShadow: "xl",
        },
        closeButton: {
          top: 4,
          right: 4,
          size: "lg",
        },
      },
    },
    // Badge component for stock status
    Badge: {
      baseStyle: {
        borderRadius: "md",
        fontWeight: "semibold",
        fontSize: "12px",
        px: 2,
        py: 1,
      },
      variants: {
        stock: {
          bg: "success.500",
          color: "white",
        },
        "low-stock": {
          bg: "warning.500",
          color: "white",
        },
        "out-of-stock": {
          bg: "error.500",
          color: "white",
        },
      },
    },
    // Toast component for notifications
    Toast: {
      baseStyle: {
        borderRadius: "lg",
        fontWeight: "semibold",
      },
    },
  },
  // Custom breakpoints for different screen sizes
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "992px",
    xl: "1280px",
    "2xl": "1536px",
  },
  // Spacing scale optimized for touch
  space: {
    px: "1px",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },
});

export default posTheme;
