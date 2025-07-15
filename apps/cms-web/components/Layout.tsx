import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Collapse,
  Icon,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  useToast,
} from "@chakra-ui/react";
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiSettings,
  FiMenu,
  FiGrid,
  FiChevronDown,
  FiChevronRight,
  FiMapPin,
  FiUserPlus,
  FiShield,
  FiBell,
  FiServer,
  FiDatabase,
  FiUser,
  FiLogOut,
  FiEdit3,
  FiBarChart,
  FiTrendingUp,
  FiCalendar,
  FiTarget,
  FiDollarSign,
  FiPieChart,
} from "react-icons/fi";
import { useAuth } from "../lib/auth";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  hasSubmenu?: boolean;
  submenu?: {
    name: string;
    href: string;
    icon: any;
  }[];
}

const navigation: NavigationItem[] = [
  { name: "แดชบอร์ด", href: "/dashboard", icon: FiHome },
  { name: "สินค้า", href: "/products", icon: FiPackage },
  { name: "หมวดหมู่", href: "/categories", icon: FiGrid },
  { name: "คำสั่งซื้อ", href: "/orders", icon: FiShoppingCart },
  { name: "ลูกค้า", href: "/customers", icon: FiUsers },
  {
    name: "รายงาน",
    icon: FiBarChart,
    hasSubmenu: true,
    submenu: [
      { name: "ภาพรวม", href: "/reports", icon: FiBarChart },
      { name: "รายงานขาย", href: "/reports/sales", icon: FiTrendingUp },
      {
        name: "รายงานขายรายวัน",
        href: "/reports/daily-sales",
        icon: FiCalendar,
      },
      { name: "รายงานสต็อก", href: "/reports/inventory", icon: FiPackage },
      { name: "รายงานลูกค้า", href: "/reports/customers", icon: FiUsers },
      {
        name: "เปรียบเทียบสาขา",
        href: "/reports/branch-comparison",
        icon: FiPieChart,
      },
      {
        name: "เป้าหมายยอดขาย",
        href: "/reports/sales-targets",
        icon: FiTarget,
      },
      { name: "กำไรขาดทุน", href: "/reports/profit-loss", icon: FiDollarSign },
    ],
  },
  {
    name: "ตั้งค่า",
    icon: FiSettings,
    hasSubmenu: true,
    submenu: [
      { name: "ภาพรวม", href: "/settings", icon: FiSettings },
      { name: "จัดการสาขา", href: "/settings/branches", icon: FiMapPin },
      { name: "จัดการพนักงาน", href: "/settings/employees", icon: FiUserPlus },
      { name: "ความปลอดภัย", href: "/settings/security", icon: FiShield },
      { name: "การแจ้งเตือน", href: "/settings/notifications", icon: FiBell },
      { name: "ระบบและเซิร์ฟเวอร์", href: "/settings/system", icon: FiServer },
      {
        name: "การเชื่อมต่อ",
        href: "/settings/integrations",
        icon: FiDatabase,
      },
    ],
  },
];

export default function Layout({
  children,
  title = "ShopFlow CMS",
}: LayoutProps) {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userProfile, signOut } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<{
    [key: string]: boolean;
  }>({});

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "ออกจากระบบเรียบร้อย",
        description: "ขอบคุณที่ใช้บริการ ShopFlow",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isSubmenuActive = (submenu: NavigationItem["submenu"]) => {
    return submenu?.some((subItem) => router.pathname === subItem.href);
  };

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    const isActive = item.href ? router.pathname === item.href : false;
    const hasActiveSubmenu = item.submenu
      ? isSubmenuActive(item.submenu)
      : false;
    const isExpanded = expandedMenus[item.name];

    const navColors = isMobile
      ? {
          activeColor: "blue.600",
          activeBg: "blue.50",
          hoverColor: "blue.700",
          hoverBg: "blue.100",
          normalColor: "gray.700",
          normalBg: "transparent",
        }
      : {
          activeColor: "white",
          activeBg: "whiteAlpha.200",
          hoverColor: "white",
          hoverBg: "whiteAlpha.100",
          normalColor: "gray.300",
          normalBg: "transparent",
        };

    if (item.hasSubmenu && item.submenu) {
      return (
        <Box key={item.name}>
          <Flex
            align="center"
            p={4}
            mx={2}
            borderRadius="xl"
            cursor="pointer"
            bg={hasActiveSubmenu ? navColors.activeBg : navColors.normalBg}
            color={
              hasActiveSubmenu ? navColors.activeColor : navColors.normalColor
            }
            _hover={{
              bg: navColors.hoverBg,
              color: navColors.hoverColor,
              transform: "translateX(4px)",
            }}
            _focus={{
              outline: "none",
              boxShadow: "none",
            }}
            _active={{
              outline: "none",
              boxShadow: "none",
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            position="relative"
            onClick={() => toggleMenu(item.name)}
          >
            {hasActiveSubmenu && !isMobile && (
              <Box
                position="absolute"
                left="0"
                top="50%"
                transform="translateY(-50%)"
                width="4px"
                height="60%"
                bg="linear-gradient(180deg, #667eea 0%, #764ba2 100%)"
                borderRadius="0 4px 4px 0"
              />
            )}
            <Box mr={4} fontSize="20" zIndex="1">
              <item.icon />
            </Box>
            <Text
              fontWeight={hasActiveSubmenu ? "semibold" : "medium"}
              fontSize="sm"
              fontFamily="body"
              flex={1}
              zIndex="1"
              letterSpacing="tight"
            >
              {item.name}
            </Text>
            <Icon
              as={isExpanded ? FiChevronDown : FiChevronRight}
              color={isMobile ? "gray.400" : "gray.400"}
              transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              transform={isExpanded ? "rotate(0deg)" : "rotate(0deg)"}
              zIndex="1"
            />
          </Flex>

          <Collapse in={isExpanded} animateOpacity>
            <VStack spacing={1} align="stretch" pl={8} pt={2} pb={2}>
              {item.submenu.map((subItem) => {
                const isSubActive = router.pathname === subItem.href;
                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    style={{
                      textDecoration: "none",
                      outline: "none",
                      border: "none",
                    }}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Flex
                      align="center"
                      p={3}
                      mx={2}
                      borderRadius="lg"
                      cursor="pointer"
                      bg={
                        isSubActive
                          ? isMobile
                            ? "blue.50"
                            : "whiteAlpha.200"
                          : "transparent"
                      }
                      color={
                        isSubActive
                          ? isMobile
                            ? "blue.600"
                            : "white"
                          : isMobile
                          ? "gray.600"
                          : "gray.300"
                      }
                      _hover={{
                        bg: isMobile ? "gray.50" : "whiteAlpha.100",
                        color: isMobile ? "gray.700" : "white",
                        transform: "translateX(4px)",
                      }}
                      _focus={{
                        outline: "none",
                        boxShadow: "none",
                      }}
                      _active={{
                        outline: "none",
                        boxShadow: "none",
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      position="relative"
                    >
                      {isSubActive && !isMobile && (
                        <Box
                          position="absolute"
                          left="0"
                          top="50%"
                          transform="translateY(-50%)"
                          width="3px"
                          height="50%"
                          bg="linear-gradient(180deg, #667eea 0%, #764ba2 100%)"
                          borderRadius="0 2px 2px 0"
                        />
                      )}
                      <Box mr={3} fontSize="16" zIndex="1">
                        <subItem.icon />
                      </Box>
                      <Text
                        fontWeight={isSubActive ? "semibold" : "medium"}
                        fontSize="sm"
                        fontFamily="body"
                        zIndex="1"
                        letterSpacing="tight"
                      >
                        {subItem.name}
                      </Text>
                    </Flex>
                  </Link>
                );
              })}
            </VStack>
          </Collapse>
        </Box>
      );
    } else {
      return (
        <Link
          key={item.name}
          href={item.href!}
          style={{
            textDecoration: "none",
            outline: "none",
            border: "none",
          }}
          onClick={isMobile ? onClose : undefined}
        >
          <Flex
            align="center"
            p={4}
            mx={2}
            borderRadius="xl"
            cursor="pointer"
            bg={isActive ? navColors.activeBg : navColors.normalBg}
            color={isActive ? navColors.activeColor : navColors.normalColor}
            _hover={{
              bg: navColors.hoverBg,
              color: navColors.hoverColor,
              transform: "translateX(4px)",
            }}
            _focus={{
              outline: "none",
              boxShadow: "none",
            }}
            _active={{
              outline: "none",
              boxShadow: "none",
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            position="relative"
          >
            {isActive && !isMobile && (
              <Box
                position="absolute"
                left="0"
                top="50%"
                transform="translateY(-50%)"
                width="4px"
                height="60%"
                bg="linear-gradient(180deg, #667eea 0%, #764ba2 100%)"
                borderRadius="0 4px 4px 0"
              />
            )}
            <Box mr={4} fontSize="20" zIndex="1">
              <item.icon />
            </Box>
            <Text
              fontWeight={isActive ? "semibold" : "medium"}
              fontSize="sm"
              fontFamily="body"
              zIndex="1"
              letterSpacing="tight"
            >
              {item.name}
            </Text>
          </Flex>
        </Link>
      );
    }
  };

  return (
    <Flex h="100vh" bg="gray.50">
      {/* Desktop Sidebar */}
      <Box
        display={{ base: "none", md: "block" }}
        width="280px"
        minWidth="280px"
        height="100vh"
        bg="linear-gradient(180deg, #1a202c 0%, #2d3748 100%)"
        borderRight="1px solid"
        borderColor="gray.700"
        position="fixed"
        top="0"
        left="0"
        zIndex={1000}
        overflow="auto"
        boxShadow="2xl"
      >
        <VStack spacing={0} align="stretch" w="full" h="full">
          {/* Logo */}
          <Box p={8} borderBottom="1px" borderColor="gray.600">
            <HStack spacing={3}>
              <Box
                w="10"
                h="10"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="xl" fontWeight="bold" color="white">
                  S
                </Text>
              </Box>
              <VStack align="start" spacing={0}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="white"
                  fontFamily="heading"
                  letterSpacing="tight"
                >
                  ShopFlow
                </Text>
                <Text fontSize="xs" color="gray.400" fontWeight="medium">
                  Content Management
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Navigation */}
          <VStack spacing={1} align="stretch" p={6} flex={1}>
            {navigation.map((item) => renderNavigationItem(item))}
          </VStack>

          {/* Footer Info */}
          <Box p={6} borderTop="1px" borderColor="gray.600">
            <VStack spacing={2} align="stretch">
              <Text fontSize="xs" color="gray.400" textAlign="center">
                Version 2.1.0
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                © 2025 ShopFlow CMS
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="blue.600"
              fontFamily="heading"
            >
              ShopFlow CMS
            </Text>
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={1} align="stretch" p={4}>
              {navigation.map((item) => renderNavigationItem(item, true))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content - Responsive margin */}
      <Flex
        flex={1}
        direction="column"
        ml={{ base: 0, md: "280px" }} // Adjusted for wider sidebar
      >
        {/* Top Header */}
        <HStack
          justify="space-between"
          px={8}
          py={4}
          bg="white"
          borderBottom="1px"
          borderColor="gray.200"
          h="20"
          boxShadow="sm"
          backdropFilter="blur(8px)"
          position="sticky"
          top="0"
          zIndex={100}
        >
          <HStack spacing={6}>
            <IconButton
              display={{ base: "flex", md: "none" }}
              onClick={onOpen}
              variant="ghost"
              aria-label="Open menu"
              icon={<FiMenu />}
              size="lg"
              color="gray.600"
              _hover={{ bg: "gray.100" }}
            />
            <VStack align="start" spacing={0}>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="gray.900"
                fontFamily="heading"
                letterSpacing="tight"
              >
                {title}
              </Text>
              <Text fontSize="sm" color="gray.500" fontFamily="body">
                จัดการและควบคุมระบบของคุณ
              </Text>
            </VStack>
          </HStack>

          {/* User Profile Section */}
          <HStack spacing={3}>
            {/* Current Date */}
            <Text
              fontSize="sm"
              color="gray.500"
              fontFamily="body"
              display={{ base: "none", sm: "block" }}
            >
              {new Date().toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            {/* User Menu */}
            <Menu>
              <MenuButton>
                <HStack
                  spacing={3}
                  cursor="pointer"
                  p={2}
                  borderRadius="lg"
                  _hover={{ bg: "gray.50" }}
                  transition="all 0.2s"
                >
                  <Avatar
                    size="sm"
                    name={userProfile?.display_name || "User"}
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userProfile?.display_name || "User"
                    )}&background=3182CE&color=fff&size=32`}
                  />
                  <VStack
                    align="start"
                    spacing={0}
                    display={{ base: "none", md: "flex" }}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.900"
                      lineHeight="short"
                    >
                      {userProfile?.display_name || "ผู้ใช้"}
                    </Text>
                    <HStack spacing={1}>
                      <Badge
                        size="xs"
                        colorScheme={
                          userProfile?.role === "admin" ? "purple" : "blue"
                        }
                        variant="subtle"
                      >
                        {userProfile?.role === "admin"
                          ? "ผู้ดูแลระบบ"
                          : userProfile?.role === "staff"
                          ? "พนักงาน"
                          : "ผู้ใช้"}
                      </Badge>
                      {userProfile?.branch && (
                        <Text fontSize="xs" color="gray.500">
                          {userProfile.branch.name}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                  {/* Dropdown Icon */}
                  <Icon
                    as={FiChevronDown}
                    boxSize={4}
                    color="gray.400"
                    ml={{ base: 0, md: 1 }}
                  />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem
                  icon={<FiUser />}
                  onClick={() => router.push("/profile")}
                >
                  ข้อมูลส่วนตัว
                </MenuItem>
                <MenuItem
                  icon={<FiEdit3 />}
                  onClick={() => router.push("/profile/edit")}
                >
                  แก้ไขโปรไฟล์
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  icon={<FiLogOut />}
                  onClick={handleLogout}
                  color="red.500"
                  _hover={{ bg: "red.50" }}
                >
                  ออกจากระบบ
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>

        {/* Page Content */}
        <Box
          flex={1}
          p={8}
          overflow="auto"
          bg="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
          minH="calc(100vh - 80px)"
        >
          <Box
            maxW="full"
            mx="auto"
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            p={8}
            border="1px"
            borderColor="gray.100"
          >
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
