import React, { ReactNode } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  IconButton,
  Button,
  Spacer,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiHome,
  FiShoppingCart,
  FiClipboard,
  FiBox,
  FiLayers,
  FiBarChart2,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import { POSRealtimeStatus } from "../realtime/POSRealtimeStatus";

interface POSLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

const navLinks: { label: string; href: string; icon: JSX.Element }[] = [
  { label: "หน้าหลัก", href: "/", icon: <FiHome /> },
  { label: "ขายสินค้า", href: "/sales", icon: <FiShoppingCart /> },
  { label: "ออเดอร์", href: "/orders", icon: <FiClipboard /> },
  { label: "สินค้า", href: "/products", icon: <FiBox /> },
  { label: "สต็อก", href: "/inventory", icon: <FiLayers /> },
  { label: "รายงาน", href: "/reports", icon: <FiBarChart2 /> },
  { label: "ลูกค้า", href: "/customers", icon: <FiUsers /> },
  { label: "ตั้งค่า", href: "/settings", icon: <FiSettings /> },
];

export const POSLayout = ({
  children,
  title = "POS System",
  showHeader = true,
  showFooter = true,
}: POSLayoutProps) => {
  const headerBg = useColorModeValue("white", "gray.900");
  const headerTextColor = useColorModeValue("pos.primary.700", "white");
  const navActiveBg = useColorModeValue("pos.primary.50", "pos.primary.700");
  const navActiveColor = useColorModeValue("pos.primary.700", "white");
  const navHoverBg = useColorModeValue("pos.primary.100", "pos.primary.600");
  const footerBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const router = useRouter();

  return (
    <Flex direction="column" minH="100vh" bg="pos.background">
      {showHeader && (
        <Box
          bg={headerBg}
          color={headerTextColor}
          px={6}
          py={3}
          borderBottom="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <HStack justify="space-between" align="center" spacing={6}>
            {/* Logo/Brand */}
            <Link href="/" passHref legacyBehavior>
              <HStack as="a" spacing={2} _hover={{ opacity: 0.85 }}>
                <Box fontSize="2xl" color="pos.primary.600">
                  🏪
                </Box>
                <Text
                  fontWeight="bold"
                  fontSize="xl"
                  letterSpacing="tight"
                  color="pos.primary.700"
                >
                  ShopFlow POS
                </Text>
              </HStack>
            </Link>
            {/* Navigation */}
            <HStack spacing={1} as="nav">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} passHref legacyBehavior>
                  <Button
                    as="a"
                    leftIcon={link.icon}
                    variant="ghost"
                    bg={
                      router.pathname === link.href
                        ? navActiveBg
                        : "transparent"
                    }
                    color={
                      router.pathname === link.href
                        ? navActiveColor
                        : headerTextColor
                    }
                    _hover={{ bg: navHoverBg, color: navActiveColor }}
                    fontWeight={
                      router.pathname === link.href ? "bold" : "normal"
                    }
                    size="sm"
                    px={3}
                    py={2}
                    borderRadius="md"
                    transition="all 0.15s"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </HStack>
            <Spacer />

            {/* Real-time Status */}
            <POSRealtimeStatus compact={true} />

            {/* Future: User menu, notifications, etc. */}
          </HStack>
        </Box>
      )}

      <Box flex="1" p={4} overflow="auto" bg="pos.background">
        {children as any}
      </Box>

      {showFooter && (
        <Box
          bg={footerBg}
          px={6}
          py={3}
          borderTop="1px"
          borderColor={borderColor}
          color="gray.600"
        >
          <HStack justify="space-between" align="center">
            <Text fontSize="sm">
              © 2024 ShopFlow POS - Educational Use Only
            </Text>
            <Text fontSize="sm">v1.0.0</Text>
          </HStack>
        </Box>
      )}
    </Flex>
  );
};
