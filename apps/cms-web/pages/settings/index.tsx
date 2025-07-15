import { ReactElement, useState } from "react";
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
} from "react-icons/fi";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import { NextPageWithLayout } from "../_app";

function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

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
        {settingsMenus.map((menu, index) => (
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

      {/* General Settings */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiSettings} boxSize={5} />
            <Heading size="md">ข้อมูลบริษัทและการตั้งค่าทั่วไป</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>ชื่อบริษัท</FormLabel>
                <Input defaultValue="บริษัท ShopFlow จำกัด" />
              </FormControl>

              <FormControl>
                <FormLabel>เลขประจำตัวผู้เสียภาษี</FormLabel>
                <Input defaultValue="0-1234-56789-01-2" />
              </FormControl>

              <FormControl>
                <FormLabel>อีเมลติดต่อหลัก</FormLabel>
                <Input defaultValue="contact@shopflow.com" type="email" />
              </FormControl>

              <FormControl>
                <FormLabel>เบอร์โทรศัพท์</FormLabel>
                <Input defaultValue="02-123-4567" />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>ที่อยู่บริษัท</FormLabel>
              <Textarea
                defaultValue="123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110"
                rows={3}
              />
            </FormControl>

            <Divider />

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>สกุลเงิน</FormLabel>
                <Select defaultValue="THB">
                  <option value="THB">บาท (THB)</option>
                  <option value="USD">ดอลลาร์ (USD)</option>
                  <option value="EUR">ยูโร (EUR)</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>เขตเวลา</FormLabel>
                <Select defaultValue="Asia/Bangkok">
                  <option value="Asia/Bangkok">GMT+7 (Asia/Bangkok)</option>
                  <option value="UTC">GMT+0 (UTC)</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>รูปแบบวันที่</FormLabel>
                <Select defaultValue="DD/MM/YYYY">
                  <option value="DD/MM/YYYY">วัน/เดือน/ปี</option>
                  <option value="MM/DD/YYYY">เดือน/วัน/ปี</option>
                  <option value="YYYY-MM-DD">ปี-เดือน-วัน</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>ภาษาหลัก</FormLabel>
                <Select defaultValue="th">
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
                <Switch colorScheme="orange" />
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text>การบันทึก Log อัตโนมัติ</Text>
                  <Text fontSize="sm" color="gray.600">
                    บันทึกการทำงานของระบบสำหรับการวิเคราะห์
                  </Text>
                </VStack>
                <Switch defaultChecked colorScheme="blue" />
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text>การสำรองข้อมูลอัตโนมัติ</Text>
                  <Text fontSize="sm" color="gray.600">
                    สำรองข้อมูลทุกวันในเวลา 02:00 น.
                  </Text>
                </VStack>
                <Switch defaultChecked colorScheme="green" />
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text>การแจ้งเตือนผ่าน Email</Text>
                  <Text fontSize="sm" color="gray.600">
                    ส่งการแจ้งเตือนสำคัญผ่านอีเมล
                  </Text>
                </VStack>
                <Switch defaultChecked colorScheme="purple" />
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* System Status */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiServer} boxSize={5} />
            <Heading size="md">สถานะระบบ</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <VStack spacing={2}>
              <Icon as={FiDatabase} boxSize={8} color="green.500" />
              <Text fontWeight="semibold">ฐานข้อมูล</Text>
              <Badge colorScheme="green">เชื่อมต่อปกติ</Badge>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                อัปเดตล่าสุด: 5 นาทีที่แล้ว
              </Text>
            </VStack>

            <VStack spacing={2}>
              <Icon as={FiMail} boxSize={8} color="blue.500" />
              <Text fontWeight="semibold">ระบบอีเมล</Text>
              <Badge colorScheme="blue">ทำงานปกติ</Badge>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                ส่งอีเมลล่าสุด: 1 ชั่วโมงที่แล้ว
              </Text>
            </VStack>

            <VStack spacing={2}>
              <Icon as={FiShield} boxSize={8} color="purple.500" />
              <Text fontWeight="semibold">ความปลอดภัย</Text>
              <Badge colorScheme="purple">ป้องกันแล้ว</Badge>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                ตรวจสอบล่าสุด: 30 นาทีที่แล้ว
              </Text>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Save Button */}
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
              <Button leftIcon={<FiRefreshCw />} variant="outline">
                รีเซ็ต
              </Button>
              <Button
                leftIcon={<FiSave />}
                colorScheme="blue"
                isLoading={isLoading}
                onClick={handleSave}
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
