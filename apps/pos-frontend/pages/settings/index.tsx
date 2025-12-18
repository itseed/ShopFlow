import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Icon,
  Progress,
  Flex,
  Avatar,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  IoAdd,
  IoRemove,
  IoEye,
  IoRefresh,
  IoWarning,
  IoCheckmark,
  IoClose,
  IoEllipsisVertical,
  IoDownload,
  IoPrint,
  IoPerson,
  IoCard,
  IoTime,
  IoSettings,
  IoBusiness,
  IoReceipt,
  IoShield,
  IoCloudUpload,
  IoCloudDownload,
  IoPeople,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoCash,
  IoCardOutline,
  IoLockClosed,
  IoKey,
  IoServer,
  IoWifi,
  IoHardwareChip,
  IoDocumentText,
  IoNotifications,
  IoCalendar,
  IoStatsChart,
} from "react-icons/io5";
import { POSLayout } from "../../components";

interface SystemSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  currency: string;
  taxRate: number;
  receiptFooter: string;
  printerName: string;
  printerIP: string;
  autoBackup: boolean;
  backupFrequency: string;
  lastBackup: Date;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "cashier";
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
}

const mockSettings: SystemSettings = {
  storeName: "ShopFlow Coffee Shop",
  storeAddress: "123 ถนนสุขุมวิท, กรุงเทพฯ 10110",
  storePhone: "02-123-4567",
  storeEmail: "info@shopflow.com",
  currency: "THB",
  taxRate: 7.0,
  receiptFooter: "ขอบคุณที่ใช้บริการ ShopFlow\nติดต่อเรา: 02-123-4567",
  printerName: "Thermal Printer",
  printerIP: "192.168.1.100",
  autoBackup: true,
  backupFrequency: "daily",
  lastBackup: new Date("2024-01-18"),
};

const mockEmployees: Employee[] = [
  {
    id: "EMP001",
    firstName: "สมชาย",
    lastName: "ใจดี",
    email: "somchai@shopflow.com",
    phone: "081-234-5678",
    role: "admin",
    isActive: true,
    lastLogin: new Date("2024-01-18"),
    createdAt: new Date("2023-01-01"),
  },
  {
    id: "EMP002",
    firstName: "สมหญิง",
    lastName: "รักดี",
    email: "somying@shopflow.com",
    phone: "082-345-6789",
    role: "manager",
    isActive: true,
    lastLogin: new Date("2024-01-17"),
    createdAt: new Date("2023-02-01"),
  },
  {
    id: "EMP003",
    firstName: "วิชัย",
    lastName: "มั่งมี",
    email: "wichai@shopflow.com",
    phone: "083-456-7890",
    role: "cashier",
    isActive: true,
    lastLogin: new Date("2024-01-16"),
    createdAt: new Date("2023-03-01"),
  },
];

const SettingsPage = () => {
  const [settings, setSettings] = useState<SystemSettings>(mockSettings);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const { isOpen: isAddEmployeeOpen, onOpen: onAddEmployeeOpen, onClose: onAddEmployeeClose } = useDisclosure();
  const { isOpen: isEditEmployeeOpen, onOpen: onEditEmployeeOpen, onClose: onEditEmployeeClose } = useDisclosure();
  const { isOpen: isBackupOpen, onOpen: onBackupOpen, onClose: onBackupClose } = useDisclosure();
  
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "cashier" as const,
  });
  
  const toast = useToast();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Mock system stats
  const systemStats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.isActive).length,
    systemUptime: "99.9%",
    lastBackup: "2 ชั่วโมงที่แล้ว",
    diskUsage: 65,
    memoryUsage: 45,
    cpuUsage: 30,
    networkStatus: "ออนไลน์",
  };

  const handleSaveSettings = () => {
    toast({
      title: "บันทึกการตั้งค่าเรียบร้อย",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const employee: Employee = {
      id: `EMP${Date.now()}`,
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      email: newEmployee.email,
      phone: newEmployee.phone,
      role: newEmployee.role,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
    };
    
    setEmployees([employee, ...employees]);
    
    toast({
      title: "เพิ่มพนักงานเรียบร้อย",
      description: `${employee.firstName} ${employee.lastName}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onAddEmployeeClose();
    setNewEmployee({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "cashier",
    });
  };

  const handleBackup = () => {
    toast({
      title: "สำรองข้อมูลเรียบร้อย",
      description: "ข้อมูลถูกสำรองไปยัง Cloud Storage แล้ว",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onBackupClose();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "red";
      case "manager": return "blue";
      case "cashier": return "green";
      default: return "gray";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "ผู้ดูแลระบบ";
      case "manager": return "ผู้จัดการ";
      case "cashier": return "พนักงานขาย";
      default: return "ไม่ทราบ";
    }
  };

  return (
    <POSLayout>
      <VStack spacing={8} align="stretch">
        {/* Header with Stats */}
        <Box
          bgGradient={bgGradient}
          borderRadius="2xl"
          p={8}
          color="white"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Flex justify="space-between" align="center" position="relative" zIndex={1}>
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                >
                  <Icon as={IoSettings} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" fontWeight="bold">
                    ⚙️ ตั้งค่าระบบ
                  </Heading>
                  <Text fontSize="lg" opacity={0.9}>
                    จัดการการตั้งค่าและระบบต่างๆ
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={4}>
                <Badge colorScheme="green" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoCheckmarkCircle} />
                    <Text>ระบบพร้อมใช้งาน</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="blue" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoWifi} />
                    <Text>{systemStats.networkStatus}</Text>
                  </HStack>
                </Badge>
              </HStack>
            </VStack>
            <VStack spacing={3}>
              <HStack spacing={2}>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<IoCloudUpload />}
                  bg="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.3)" }}
                  color="white"
                  onClick={onBackupOpen}
                >
                  สำรองข้อมูล
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<IoRefresh />}
                  bg="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.3)" }}
                  color="white"
                >
                  รีเฟรช
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* System Status */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">พนักงานทั้งหมด</Text>
                  <Icon as={IoPeople} color="blue.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {systemStats.totalEmployees}
                </Text>
                <Text fontSize="sm" color="gray.500">คน</Text>
                <Progress value={80} colorScheme="blue" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">ระบบอัพไทม์</Text>
                  <Icon as={IoStatsChart} color="green.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  {systemStats.systemUptime}
                </Text>
                <Text fontSize="sm" color="gray.500">ความเสถียร</Text>
                <Progress value={99} colorScheme="green" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">การใช้ดิสก์</Text>
                  <Icon as={IoHardwareChip} color="orange.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                  {systemStats.diskUsage}%
                </Text>
                <Text fontSize="sm" color="gray.500">พื้นที่</Text>
                <Progress value={systemStats.diskUsage} colorScheme="orange" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">การใช้หน่วยความจำ</Text>
                  <Icon as={IoServer} color="purple.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                  {systemStats.memoryUsage}%
                </Text>
                <Text fontSize="sm" color="gray.500">RAM</Text>
                <Progress value={systemStats.memoryUsage} colorScheme="purple" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Settings Tabs */}
        <Box>
          <Heading size="md" mb={6} color="gray.700">
            🔧 การตั้งค่าต่างๆ
          </Heading>
          
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={IoBusiness} />
                  <Text>ข้อมูลร้าน</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={IoReceipt} />
                  <Text>การขาย</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={IoPeople} />
                  <Text>พนักงาน</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={IoShield} />
                  <Text>ความปลอดภัย</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={IoServer} />
                  <Text>ระบบ</Text>
                </HStack>
              </Tab>
            </TabList>
            <TabPanels>
              {/* Store Information Tab */}
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                  <CardBody>
                    <VStack spacing={6}>
                      <Heading size="md" color="gray.700">
                        ข้อมูลร้านค้า
                      </Heading>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                        <FormControl>
                          <FormLabel>ชื่อร้าน</FormLabel>
                          <Input
                            value={settings.storeName}
                            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                            placeholder="ชื่อร้าน"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>เบอร์โทร</FormLabel>
                          <Input
                            value={settings.storePhone}
                            onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                            placeholder="เบอร์โทร"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>อีเมล</FormLabel>
                          <Input
                            type="email"
                            value={settings.storeEmail}
                            onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                            placeholder="อีเมล"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>สกุลเงิน</FormLabel>
                          <Select
                            value={settings.currency}
                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                          >
                            <option value="THB">บาท (THB)</option>
                            <option value="USD">ดอลลาร์ (USD)</option>
                            <option value="EUR">ยูโร (EUR)</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl>
                        <FormLabel>ที่อยู่</FormLabel>
                        <Textarea
                          value={settings.storeAddress}
                          onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                          placeholder="ที่อยู่ร้าน"
                          rows={3}
                        />
                      </FormControl>
                      
                      <Button colorScheme="blue" onClick={handleSaveSettings} w="full">
                        บันทึกการตั้งค่า
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Sales Settings Tab */}
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                  <CardBody>
                    <VStack spacing={6}>
                      <Heading size="md" color="gray.700">
                        การตั้งค่าการขาย
                      </Heading>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                        <FormControl>
                          <FormLabel>อัตราภาษี (%)</FormLabel>
                          <NumberInput
                            value={settings.taxRate}
                            onChange={(_, value) => setSettings({ ...settings, taxRate: value })}
                            min={0}
                            max={100}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>เครื่องพิมพ์</FormLabel>
                          <Input
                            value={settings.printerName}
                            onChange={(e) => setSettings({ ...settings, printerName: e.target.value })}
                            placeholder="ชื่อเครื่องพิมพ์"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>IP เครื่องพิมพ์</FormLabel>
                          <Input
                            value={settings.printerIP}
                            onChange={(e) => setSettings({ ...settings, printerIP: e.target.value })}
                            placeholder="192.168.1.100"
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl>
                        <FormLabel>ข้อความท้ายใบเสร็จ</FormLabel>
                        <Textarea
                          value={settings.receiptFooter}
                          onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                          placeholder="ข้อความท้ายใบเสร็จ"
                          rows={4}
                        />
                      </FormControl>
                      
                      <Button colorScheme="blue" onClick={handleSaveSettings} w="full">
                        บันทึกการตั้งค่า
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Employees Tab */}
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                  <CardBody>
                    <VStack spacing={6}>
                      <HStack justify="space-between" w="full">
                        <Heading size="md" color="gray.700">
                          จัดการพนักงาน
                        </Heading>
                        <Button
                          colorScheme="blue"
                          leftIcon={<IoAdd />}
                          onClick={onAddEmployeeOpen}
                        >
                          เพิ่มพนักงาน
                        </Button>
                      </HStack>
                      
                      <Box overflowX="auto" w="full">
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>พนักงาน</Th>
                              <Th>ตำแหน่ง</Th>
                              <Th>สถานะ</Th>
                              <Th>เข้าสู่ระบบล่าสุด</Th>
                              <Th>การดำเนินการ</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {employees.map((employee) => (
                              <Tr key={employee.id}>
                                <Td>
                                  <HStack spacing={3}>
                                    <Avatar 
                                      name={`${employee.firstName} ${employee.lastName}`}
                                      size="md"
                                      bg={getRoleColor(employee.role) + ".100"}
                                      color={getRoleColor(employee.role) + ".600"}
                                    />
                                    <VStack align="start" spacing={1}>
                                      <Text fontWeight="bold">
                                        {employee.firstName} {employee.lastName}
                                      </Text>
                                      <Text fontSize="sm" color="gray.500">
                                        {employee.email}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </Td>
                                <Td>
                                  <Badge colorScheme={getRoleColor(employee.role)} variant="subtle">
                                    {getRoleText(employee.role)}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge colorScheme={employee.isActive ? "green" : "red"} variant="subtle">
                                    {employee.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" color="gray.500">
                                    {employee.lastLogin.toLocaleDateString()}
                                  </Text>
                                </Td>
                                <Td>
                                  <Menu>
                                    <MenuButton
                                      as={IconButton}
                                      icon={<IoEllipsisVertical />}
                                      variant="ghost"
                                      size="sm"
                                    />
                                    <MenuList>
                                      <MenuItem
                                        icon={<IoEye />}
                                        onClick={() => {
                                          setSelectedEmployee(employee);
                                          onEditEmployeeOpen();
                                        }}
                                      >
                                        ดูข้อมูล
                                      </MenuItem>
                                      <MenuItem
                                        icon={<IoPerson />}
                                        onClick={() => {
                                          setSelectedEmployee(employee);
                                          onEditEmployeeOpen();
                                        }}
                                      >
                                        แก้ไข
                                      </MenuItem>
                                    </MenuList>
                                  </Menu>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Security Tab */}
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                  <CardBody>
                    <VStack spacing={6}>
                      <Heading size="md" color="gray.700">
                        ความปลอดภัย
                      </Heading>
                      
                      <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>การรักษาความปลอดภัย!</AlertTitle>
                          <AlertDescription>
                            ระบบมีการเข้ารหัสข้อมูลและมีการสำรองข้อมูลอัตโนมัติ
                          </AlertDescription>
                        </Box>
                      </Alert>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">
                            <HStack spacing={2}>
                              <Icon as={IoLockClosed} />
                              <Text>การยืนยันตัวตน 2 ขั้นตอน</Text>
                            </HStack>
                          </FormLabel>
                          <Switch colorScheme="green" />
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">
                            <HStack spacing={2}>
                              <Icon as={IoKey} />
                              <Text>การเข้ารหัสข้อมูล</Text>
                            </HStack>
                          </FormLabel>
                          <Switch colorScheme="green" defaultChecked />
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">
                            <HStack spacing={2}>
                              <Icon as={IoNotifications} />
                              <Text>การแจ้งเตือนความปลอดภัย</Text>
                            </HStack>
                          </FormLabel>
                          <Switch colorScheme="green" defaultChecked />
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">
                            <HStack spacing={2}>
                              <Icon as={IoCalendar} />
                              <Text>การหมดอายุรหัสผ่าน</Text>
                            </HStack>
                          </FormLabel>
                          <Switch colorScheme="green" />
                        </FormControl>
                      </SimpleGrid>
                      
                      <Button colorScheme="blue" onClick={handleSaveSettings} w="full">
                        บันทึกการตั้งค่า
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* System Tab */}
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                  <CardBody>
                    <VStack spacing={6}>
                      <Heading size="md" color="gray.700">
                        การตั้งค่าระบบ
                      </Heading>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">
                            <HStack spacing={2}>
                              <Icon as={IoCloudUpload} />
                              <Text>สำรองข้อมูลอัตโนมัติ</Text>
                            </HStack>
                          </FormLabel>
                          <Switch 
                            colorScheme="green" 
                            isChecked={settings.autoBackup}
                            onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>ความถี่การสำรอง</FormLabel>
                          <Select
                            value={settings.backupFrequency}
                            onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                          >
                            <option value="daily">ทุกวัน</option>
                            <option value="weekly">ทุกสัปดาห์</option>
                            <option value="monthly">ทุกเดือน</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>
                      
                      <Alert status="success" borderRadius="lg">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>ระบบทำงานปกติ!</AlertTitle>
                          <AlertDescription>
                            การสำรองข้อมูลล่าสุด: {settings.lastBackup.toLocaleDateString()}
                          </AlertDescription>
                        </Box>
                      </Alert>
                      
                      <Button colorScheme="blue" onClick={handleSaveSettings} w="full">
                        บันทึกการตั้งค่า
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Add Employee Modal */}
        <Modal isOpen={isAddEmployeeOpen} onClose={onAddEmployeeClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>เพิ่มพนักงานใหม่</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <HStack w="full" spacing={4}>
                  <FormControl>
                    <FormLabel>ชื่อ</FormLabel>
                    <Input
                      placeholder="ชื่อ"
                      value={newEmployee.firstName}
                      onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>นามสกุล</FormLabel>
                    <Input
                      placeholder="นามสกุล"
                      value={newEmployee.lastName}
                      onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    />
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel>อีเมล</FormLabel>
                  <Input
                    type="email"
                    placeholder="อีเมล"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>เบอร์โทร</FormLabel>
                  <Input
                    placeholder="เบอร์โทร"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>ตำแหน่ง</FormLabel>
                  <Select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as any })}
                  >
                    <option value="cashier">พนักงานขาย</option>
                    <option value="manager">ผู้จัดการ</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddEmployeeClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="blue" onClick={handleAddEmployee}>
                เพิ่มพนักงาน
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Backup Modal */}
        <Modal isOpen={isBackupOpen} onClose={onBackupClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>สำรองข้อมูล</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>การสำรองข้อมูล</AlertTitle>
                    <AlertDescription>
                      ข้อมูลจะถูกสำรองไปยัง Cloud Storage และสามารถกู้คืนได้ในภายหลัง
                    </AlertDescription>
                  </Box>
                </Alert>
                <Text>
                  การสำรองข้อมูลล่าสุด: {settings.lastBackup.toLocaleDateString()}
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onBackupClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="blue" onClick={handleBackup}>
                สำรองข้อมูล
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </POSLayout>
  );
};

export default SettingsPage;

// Disable static generation for pages that use React Query
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
