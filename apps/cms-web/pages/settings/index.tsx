import { ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Button,
  Icon,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Select,
  Textarea,
  Divider,
  useToast,
  SimpleGrid,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Spinner,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Tooltip,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiDatabase,
  FiMail,
  FiShield,
  FiBell,
  FiMapPin,
  FiUsers,
  FiArrowRight,
  FiServer,
  FiChevronDown,
  FiChevronRight,
  FiUserPlus,
  FiUserCheck,
  FiLock,
  FiKey,
  FiActivity,
  FiCpu,
  FiHardDrive,
  FiCloudDrizzle,
  FiLink,
  FiGlobe,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiZap,
  FiWifi,
} from "react-icons/fi";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import {
  PermissionGuard,
  CanAccess,
} from "../../components/auth/PermissionGuard";
import { AdminOnly } from "../../components/auth/RoleGuard";
import { useHasPermission } from "../../lib/hooks/useAuthEnhanced";
import { NextPageWithLayout } from "../_app";
import {
  useSystemStatus,
  useDatabaseInfo,
  useSystemSettings,
  useConnectionTest,
} from "../../lib/hooks/useSystemStatus";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const hasPermission = useHasPermission();
  const toast = useToast();

  // System monitoring hooks
  const {
    status,
    loading: statusLoading,
    error: statusError,
    refresh: refreshStatus,
  } = useSystemStatus();
  const {
    dbInfo,
    loading: dbLoading,
    error: dbError,
    refresh: refreshDbInfo,
  } = useDatabaseInfo();
  const {
    settings,
    loading: settingsLoading,
    saving,
    updateSettings,
    error: settingsError,
  } = useSystemSettings();
  const { testing, testConnection } = useConnectionTest();

  const handleSave = async () => {
    if (!settings) return;

    setIsLoading(true);
    try {
      const result = await updateSettings(settings);
      if (result.success) {
        toast({
          title: "บันทึกการตั้งค่าสำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error
            ? error.message
            : "ไม่สามารถบันทึกการตั้งค่าได้",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    const result = await testConnection();
    if (result.success) {
      toast({
        title: "การเชื่อมต่อสำเร็จ",
        description: "ระบบทำงานปกติทุกส่วน",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "การเชื่อมต่อล้มเหลว",
        description: result.error || "มีปัญหาในการเชื่อมต่อระบบ",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (isWorking: boolean) => (isWorking ? "green" : "red");
  const getStatusIcon = (isWorking: boolean) =>
    isWorking ? FiCheckCircle : FiXCircle;

  const settingsMenus = [
    {
      title: "จัดการสาขา",
      description: "จัดการข้อมูลสาขาต่างๆ ของบริษัท",
      icon: FiMapPin,
      href: "/settings/branches",
      color: "blue",
      stats: "3 สาขา",
      hasSubmenu: true,
      submenu: [
        {
          title: "รายชื่อสาขา",
          description: "ดูและจัดการข้อมูลสาขาทั้งหมด",
          icon: FiMapPin,
          href: "/settings/branches",
          color: "blue",
        },
        {
          title: "เพิ่มสาขาใหม่",
          description: "เพิ่มสาขาใหม่เข้าสู่ระบบ",
          icon: FiMapPin,
          href: "/settings/branches/new",
          color: "green",
        },
      ],
    },
    {
      title: "จัดการพนักงาน",
      description: "จัดการข้อมูลพนักงานและสิทธิ์การเข้าถึง",
      icon: FiUsers,
      href: "/settings/employees",
      color: "green",
      stats: "12 คน",
      hasSubmenu: true,
      submenu: [
        {
          title: "รายชื่อพนักงาน",
          description: "ดูและจัดการข้อมูลพนักงาน",
          icon: FiUsers,
          href: "/settings/employees",
          color: "green",
        },
        {
          title: "เพิ่มพนักงาน",
          description: "เพิ่มพนักงานใหม่เข้าสู่ระบบ",
          icon: FiUserPlus,
          href: "/settings/employees/new",
          color: "blue",
        },
        {
          title: "บทบาทและสิทธิ์",
          description: "จัดการบทบาทและสิทธิ์การเข้าถึง",
          icon: FiUserCheck,
          href: "/settings/employees/roles",
          color: "purple",
        },
      ],
    },
    {
      title: "ความปลอดภัย",
      description: "การตั้งค่าความปลอดภัยและการรับรองตัวตน",
      icon: FiShield,
      href: "/settings/security",
      color: "red",
      stats: "2FA เปิด",
      hasSubmenu: true,
      submenu: [
        {
          title: "การรับรองตัวตน",
          description: "ตั้งค่า 2FA และการเข้าสู่ระบบ",
          icon: FiLock,
          href: "/settings/security",
          color: "red",
        },
        {
          title: "API Keys",
          description: "จัดการ API Keys และ Access Tokens",
          icon: FiKey,
          href: "/settings/security/api-keys",
          color: "orange",
        },
        {
          title: "ประวัติการเข้าถึง",
          description: "ติดตามการเข้าสู่ระบบและกิจกรรม",
          icon: FiActivity,
          href: "/settings/security/logs",
          color: "cyan",
        },
      ],
    },
    {
      title: "การแจ้งเตือน",
      description: "ตั้งค่าการแจ้งเตือนผ่าน Email และ SMS",
      icon: FiBell,
      href: "/settings/notifications",
      color: "orange",
      stats: "5 ประเภท",
      hasSubmenu: false,
    },
    {
      title: "ระบบและเซิร์ฟเวอร์",
      description: "การตั้งค่าระบบ ฐานข้อมูล และเซิร์ฟเวอร์",
      icon: FiServer,
      href: "/settings/system",
      color: "purple",
      stats: "Online",
      hasSubmenu: true,
      submenu: [
        {
          title: "สถานะระบบ",
          description: "ติดตามสถานะเซิร์ฟเวอร์และทรัพยากร",
          icon: FiCpu,
          href: "/settings/system",
          color: "purple",
        },
        {
          title: "จัดการฐานข้อมูล",
          description: "สำรองข้อมูลและการกู้คืน",
          icon: FiHardDrive,
          href: "/settings/system/database",
          color: "blue",
        },
        {
          title: "บำรุงรักษา",
          description: "โหมดบำรุงรักษาและอัปเดต",
          icon: FiCloudDrizzle,
          href: "/settings/system/maintenance",
          color: "gray",
        },
      ],
    },
    {
      title: "การเชื่อมต่อ",
      description: "API Keys และการเชื่อมต่อกับระบบภายนอก",
      icon: FiDatabase,
      href: "/settings/integrations",
      color: "cyan",
      stats: "5 APIs",
      hasSubmenu: true,
      submenu: [
        {
          title: "การเชื่อมต่อปัจจุบัน",
          description: "ดูและจัดการการเชื่อมต่อที่มีอยู่",
          icon: FiLink,
          href: "/settings/integrations",
          color: "cyan",
        },
        {
          title: "เพิ่มการเชื่อมต่อ",
          description: "เชื่อมต่อกับบริการภายนอกใหม่",
          icon: FiGlobe,
          href: "/settings/integrations/new",
          color: "green",
        },
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <Heading size="lg" mb={2} fontFamily="heading">
          ตั้งค่าระบบ
        </Heading>
        <Text color="gray.600">
          จัดการการตั้งค่าทั่วไป ข้อมูลบริษัท และการกำหนดค่าระบบ
        </Text>
      </Box>

      {/* Quick Settings Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        {settingsMenus
          .filter((menu) => {
            // Filter menu items based on permissions
            if (menu.title === "จัดการสาขา" || menu.title === "จัดการพนักงาน") {
              return (
                hasPermission("users.view") && hasPermission("branches.view")
              );
            }
            if (
              menu.title === "ความปลอดภัย" ||
              menu.title === "ระบบและเซิร์ฟเวอร์"
            ) {
              return hasPermission("settings.edit");
            }
            return hasPermission("settings.view");
          })
          .map((menu, index) => (
            <Box key={index}>
              {menu.hasSubmenu ? (
                <Menu>
                  <MenuButton as={Box} w="full">
                    <Card
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                      }}
                    >
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <HStack justify="space-between" w="full">
                            <Icon
                              as={menu.icon}
                              boxSize={8}
                              color={`${menu.color}.500`}
                            />
                            <HStack spacing={2}>
                              <Badge colorScheme={menu.color} variant="subtle">
                                {menu.stats}
                              </Badge>
                              <Icon
                                as={FiChevronDown}
                                color="gray.400"
                                transition="transform 0.2s"
                              />
                            </HStack>
                          </HStack>

                          <VStack align="start" spacing={2}>
                            <Text fontWeight="semibold" fontSize="lg">
                              {menu.title}
                            </Text>
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {menu.description}
                            </Text>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </MenuButton>
                  <MenuList>
                    {menu.submenu?.map((subItem, subIndex) => (
                      <Link key={subIndex} href={subItem.href}>
                        <MenuItem
                          icon={
                            <Icon
                              as={subItem.icon}
                              color={`${subItem.color}.500`}
                            />
                          }
                        >
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{subItem.title}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {subItem.description}
                            </Text>
                          </VStack>
                        </MenuItem>
                      </Link>
                    ))}
                  </MenuList>
                </Menu>
              ) : (
                <Link href={menu.href}>
                  <Card
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                  >
                    <CardBody>
                      <VStack align="start" spacing={4}>
                        <HStack justify="space-between" w="full">
                          <Icon
                            as={menu.icon}
                            boxSize={8}
                            color={`${menu.color}.500`}
                          />
                          <HStack spacing={2}>
                            <Badge colorScheme={menu.color} variant="subtle">
                              {menu.stats}
                            </Badge>
                            <Icon as={FiArrowRight} color="gray.400" />
                          </HStack>
                        </HStack>

                        <VStack align="start" spacing={2}>
                          <Text fontWeight="semibold" fontSize="lg">
                            {menu.title}
                          </Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {menu.description}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </Link>
              )}
            </Box>
          ))}
      </SimpleGrid>

      {/* General Settings with Real Data */}
      <PermissionGuard permission="settings.edit">
        <Card mb={6}>
          <CardHeader>
            <HStack>
              <Icon as={FiSettings} boxSize={5} />
              <Heading size="md">ข้อมูลบริษัทและการตั้งค่าทั่วไป</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            {settingsError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                <AlertDescription>{settingsError}</AlertDescription>
              </Alert>
            )}

            {settingsLoading ? (
              <VStack spacing={4}>
                <Spinner size="lg" />
                <Text>กำลังโหลดการตั้งค่า...</Text>
              </VStack>
            ) : settings ? (
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>ชื่อบริษัท</FormLabel>
                    <Input
                      value={settings.companyName}
                      onChange={(e) =>
                        updateSettings({ companyName: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>เลขประจำตัวผู้เสียภาษี</FormLabel>
                    <Input
                      value={settings.taxId}
                      onChange={(e) =>
                        updateSettings({ taxId: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>อีเมลติดต่อหลัก</FormLabel>
                    <Input
                      value={settings.email}
                      type="email"
                      onChange={(e) =>
                        updateSettings({ email: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>เบอร์โทรศัพท์</FormLabel>
                    <Input
                      value={settings.phone}
                      onChange={(e) =>
                        updateSettings({ phone: e.target.value })
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>ที่อยู่บริษัท</FormLabel>
                  <Textarea
                    value={settings.address}
                    onChange={(e) =>
                      updateSettings({ address: e.target.value })
                    }
                    rows={3}
                  />
                </FormControl>

                <Divider />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>สกุลเงิน</FormLabel>
                    <Select
                      value={settings.currency}
                      onChange={(e) =>
                        updateSettings({ currency: e.target.value })
                      }
                    >
                      <option value="THB">บาท (THB)</option>
                      <option value="USD">ดอลลาร์ (USD)</option>
                      <option value="EUR">ยูโร (EUR)</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>เขตเวลา</FormLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) =>
                        updateSettings({ timezone: e.target.value })
                      }
                    >
                      <option value="Asia/Bangkok">GMT+7 (Asia/Bangkok)</option>
                      <option value="UTC">GMT+0 (UTC)</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>รูปแบบวันที่</FormLabel>
                    <Select
                      value={settings.dateFormat}
                      onChange={(e) =>
                        updateSettings({ dateFormat: e.target.value })
                      }
                    >
                      <option value="DD/MM/YYYY">วัน/เดือน/ปี</option>
                      <option value="MM/DD/YYYY">เดือน/วัน/ปี</option>
                      <option value="YYYY-MM-DD">ปี-เดือน-วัน</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>ภาษาหลัก</FormLabel>
                    <Select
                      value={settings.language}
                      onChange={(e) =>
                        updateSettings({ language: e.target.value })
                      }
                    >
                      <option value="th">ไทย</option>
                      <option value="en">English</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <Divider />

                <VStack spacing={4} align="stretch">
                  <Text fontWeight="semibold">การตั้งค่าระบบ</Text>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text>โหมดการพัฒนา (Development Mode)</Text>
                      <Text fontSize="sm" color="gray.600">
                        เปิดใช้งานสำหรับการทดสอบระบบ
                      </Text>
                    </VStack>
                    <Switch
                      colorScheme="orange"
                      isChecked={settings.developmentMode}
                      onChange={(e) =>
                        updateSettings({ developmentMode: e.target.checked })
                      }
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text>การบันทึก Log อัตโนมัติ</Text>
                      <Text fontSize="sm" color="gray.600">
                        บันทึกการทำงานของระบบสำหรับการวิเคราะห์
                      </Text>
                    </VStack>
                    <Switch
                      colorScheme="blue"
                      isChecked={settings.autoLogging}
                      onChange={(e) =>
                        updateSettings({ autoLogging: e.target.checked })
                      }
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text>การสำรองข้อมูลอัตโนมัติ</Text>
                      <Text fontSize="sm" color="gray.600">
                        สำรองข้อมูลทุกวันในเวลา 02:00 น.
                      </Text>
                    </VStack>
                    <Switch
                      colorScheme="green"
                      isChecked={settings.autoBackup}
                      onChange={(e) =>
                        updateSettings({ autoBackup: e.target.checked })
                      }
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text>การแจ้งเตือนผ่าน Email</Text>
                      <Text fontSize="sm" color="gray.600">
                        ส่งการแจ้งเตือนสำคัญผ่านอีเมล
                      </Text>
                    </VStack>
                    <Switch
                      colorScheme="purple"
                      isChecked={settings.emailNotifications}
                      onChange={(e) =>
                        updateSettings({ emailNotifications: e.target.checked })
                      }
                    />
                  </HStack>
                </VStack>
              </VStack>
            ) : (
              <Alert status="warning">
                <AlertIcon />
                <AlertDescription>ไม่สามารถโหลดการตั้งค่าได้</AlertDescription>
              </Alert>
            )}
          </CardBody>
        </Card>
      </PermissionGuard>

      {/* System Status with Real Data */}
      <Card mb={6}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiServer} boxSize={5} />
              <Heading size="md">สถานะระบบ</Heading>
            </HStack>
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FiRefreshCw />}
                onClick={() => {
                  refreshStatus();
                  refreshDbInfo();
                }}
                isLoading={statusLoading || dbLoading}
                variant="outline"
              >
                รีเฟรช
              </Button>
              <Button
                size="sm"
                leftIcon={<FiZap />}
                onClick={handleTestConnection}
                isLoading={testing}
                colorScheme="blue"
              >
                ทดสอบการเชื่อมต่อ
              </Button>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          {statusError && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <AlertDescription>{statusError}</AlertDescription>
            </Alert>
          )}

          {statusLoading ? (
            <VStack spacing={4}>
              <Spinner size="lg" />
              <Text>กำลังตรวจสอบสถานะระบบ...</Text>
            </VStack>
          ) : status ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {/* Database Status */}
              <VStack spacing={3}>
                <Icon
                  as={getStatusIcon(status.database.connected)}
                  boxSize={10}
                  color={`${getStatusColor(status.database.connected)}.500`}
                />
                <VStack spacing={1}>
                  <Text fontWeight="semibold">ฐานข้อมูล</Text>
                  <Badge
                    colorScheme={getStatusColor(status.database.connected)}
                  >
                    {status.database.connected ? "เชื่อมต่อปกติ" : "ขัดข้อง"}
                  </Badge>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    {status.database.responseTime &&
                      `${status.database.responseTime}ms`}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    ตรวจสอบ:{" "}
                    {formatDistanceToNow(status.database.lastCheck, {
                      locale: th,
                      addSuffix: true,
                    })}
                  </Text>
                </VStack>
              </VStack>

              {/* Auth Status */}
              <VStack spacing={3}>
                <Icon
                  as={getStatusIcon(status.auth.working)}
                  boxSize={10}
                  color={`${getStatusColor(status.auth.working)}.500`}
                />
                <VStack spacing={1}>
                  <Text fontWeight="semibold">การรับรองตัวตน</Text>
                  <Badge colorScheme={getStatusColor(status.auth.working)}>
                    {status.auth.working ? "ทำงานปกติ" : "ขัดข้อง"}
                  </Badge>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    ตรวจสอบ:{" "}
                    {formatDistanceToNow(status.auth.lastCheck, {
                      locale: th,
                      addSuffix: true,
                    })}
                  </Text>
                </VStack>
              </VStack>

              {/* Storage Status */}
              <VStack spacing={3}>
                <Icon
                  as={getStatusIcon(status.storage.working)}
                  boxSize={10}
                  color={`${getStatusColor(status.storage.working)}.500`}
                />
                <VStack spacing={1}>
                  <Text fontWeight="semibold">จัดเก็บไฟล์</Text>
                  <Badge colorScheme={getStatusColor(status.storage.working)}>
                    {status.storage.working ? "ทำงานปกติ" : "ขัดข้อง"}
                  </Badge>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    ตรวจสอบ:{" "}
                    {formatDistanceToNow(status.storage.lastCheck, {
                      locale: th,
                      addSuffix: true,
                    })}
                  </Text>
                </VStack>
              </VStack>

              {/* Realtime Status */}
              <VStack spacing={3}>
                <Icon
                  as={status.realtime.connected ? FiWifi : FiXCircle}
                  boxSize={10}
                  color={`${getStatusColor(status.realtime.connected)}.500`}
                />
                <VStack spacing={1}>
                  <Text fontWeight="semibold">Realtime</Text>
                  <Badge
                    colorScheme={getStatusColor(status.realtime.connected)}
                  >
                    {status.realtime.connected ? "เชื่อมต่อแล้ว" : "ขัดข้อง"}
                  </Badge>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    ตรวจสอบ:{" "}
                    {formatDistanceToNow(status.realtime.lastCheck, {
                      locale: th,
                      addSuffix: true,
                    })}
                  </Text>
                </VStack>
              </VStack>
            </SimpleGrid>
          ) : (
            <Alert status="warning">
              <AlertIcon />
              <AlertDescription>
                ไม่สามารถโหลดข้อมูลสถานะระบบได้
              </AlertDescription>
            </Alert>
          )}

          {/* Database Information */}
          {dbInfo && (
            <Box mt={6}>
              <Divider mb={4} />
              <VStack spacing={4}>
                <Text fontWeight="semibold" fontSize="lg">
                  ข้อมูลฐานข้อมูล
                </Text>
                <SimpleGrid
                  columns={{ base: 2, md: 4, lg: 6 }}
                  spacing={4}
                  w="full"
                >
                  <Stat>
                    <StatLabel>เวอร์ชัน Schema</StatLabel>
                    <StatNumber fontSize="lg">
                      {dbInfo.schemaVersion || "N/A"}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>สินค้า</StatLabel>
                    <StatNumber fontSize="lg">
                      {dbInfo.totalProducts?.toLocaleString() || 0}
                    </StatNumber>
                    <StatHelpText>รายการ</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>คำสั่งซื้อ</StatLabel>
                    <StatNumber fontSize="lg">
                      {dbInfo.totalOrders?.toLocaleString() || 0}
                    </StatNumber>
                    <StatHelpText>รายการ</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>ลูกค้า</StatLabel>
                    <StatNumber fontSize="lg">
                      {dbInfo.totalCustomers?.toLocaleString() || 0}
                    </StatNumber>
                    <StatHelpText>คน</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>สาขา</StatLabel>
                    <StatNumber fontSize="lg">
                      {dbInfo.totalBranches?.toLocaleString() || 0}
                    </StatNumber>
                    <StatHelpText>แห่ง</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>สำรองข้อมูล</StatLabel>
                    <StatNumber fontSize="sm">
                      {dbInfo.lastBackup
                        ? formatDistanceToNow(dbInfo.lastBackup, {
                            locale: th,
                            addSuffix: true,
                          })
                        : "ไม่มีข้อมูล"}
                    </StatNumber>
                  </Stat>
                </SimpleGrid>
              </VStack>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Save Button with Real State */}
      <Card>
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">บันทึกการเปลี่ยนแปลง</Text>
              <Text fontSize="sm" color="gray.600">
                บันทึกการตั้งค่าทั่วไปที่ได้เปลี่ยนแปลง
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                onClick={() => {
                  refreshStatus();
                  refreshDbInfo();
                  window.location.reload(); // Simple reset for now
                }}
                isDisabled={saving || isLoading}
              >
                รีเซ็ต
              </Button>
              <Button
                leftIcon={<FiSave />}
                colorScheme="blue"
                isLoading={saving || isLoading}
                loadingText="กำลังบันทึก..."
                onClick={handleSave}
                isDisabled={!settings || settingsLoading}
              >
                บันทึกการตั้งค่า
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}

const Settings: NextPageWithLayout = () => {
  return <SettingsPage />;
};

Settings.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default withAuth(Settings);
