import React from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  IconButton,
  VStack,
  HStack,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useBreakpointValue,
  Button,
  Badge,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Link from "next/link";

// Icons (using simple text for now, can be replaced with icon library)
const MenuIcon = () => <Text>☰</Text>;
const DashboardIcon = () => <Text>📊</Text>;
const ProductIcon = () => <Text>📦</Text>;
const OrderIcon = () => <Text>🛒</Text>;
const CustomerIcon = () => <Text>👥</Text>;
const SettingsIcon = () => <Text>⚙️</Text>;

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navigation = [
  { name: "แดชบอร์ด", href: "/", icon: DashboardIcon },
  { name: "สินค้า", href: "/products", icon: ProductIcon },
  { name: "คำสั่งซื้อ", href: "/orders", icon: OrderIcon },
  { name: "ลูกค้า", href: "/customers", icon: CustomerIcon },
  { name: "ตั้งค่า", href: "/settings", icon: SettingsIcon },
];

export default function ChakraLayout({
  children,
  title = "ShopFlow CMS",
}: LayoutProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const sidebarDisplay = useBreakpointValue({ base: "none", lg: "block" });

  const SidebarContent = () => (
    <VStack align="stretch" spacing={1} h="full">
      <Box p={6} borderBottomWidth={1}>
        <Heading size="md" color="brand.600">
          ShopFlow CMS
        </Heading>
      </Box>

      <VStack align="stretch" spacing={1} flex={1} p={4}>
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          const IconComponent = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "solid" : "ghost"}
                colorScheme={isActive ? "brand" : "gray"}
                justifyContent="flex-start"
                leftIcon={<IconComponent />}
                w="full"
                fontWeight={isActive ? "semibold" : "normal"}
                borderRadius="lg"
                py={6}
                onClick={onClose}
              >
                {item.name}
              </Button>
            </Link>
          );
        })}
      </VStack>
    </VStack>
  );

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Desktop Sidebar */}
      <Box
        display={sidebarDisplay}
        position="fixed"
        left={0}
        top={0}
        w="64"
        h="full"
        bg="white"
        borderRightWidth={1}
        borderColor="gray.200"
        zIndex={10}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box ml={{ base: 0, lg: 64 }}>
        {/* Top Header */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          px={6}
          py={4}
          bg="white"
          borderBottomWidth={1}
          borderColor="gray.200"
          position="sticky"
          top={0}
          zIndex={5}
        >
          <HStack spacing={4}>
            <IconButton
              aria-label="เปิดเมนู"
              icon={<MenuIcon />}
              variant="ghost"
              display={{ base: "flex", lg: "none" }}
              onClick={onOpen}
            />
            <Heading size="lg" color="gray.800">
              {title}
            </Heading>
          </HStack>

          <HStack spacing={4}>
            <Badge
              colorScheme="green"
              variant="subtle"
              borderRadius="full"
              px={3}
              py={1}
            >
              ออนไลน์
            </Badge>
            <Text fontSize="sm" color="gray.600">
              {new Date().toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box as="main" p={6}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
