import { ReactElement, useState } from "react";
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
  Divider,
  useToast,
  SimpleGrid,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Textarea,
} from "@chakra-ui/react";
import {
  FiServer,
  FiSave,
  FiRefreshCw,
  FiDatabase,
  FiHardDrive,
  FiCpu,
  FiActivity,
  FiWifi,
  FiSettings,
  FiDownload,
  FiUpload,
  FiMonitor,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiTrash2,
  FiRotateCcw,
  FiTool,
} from "react-icons/fi";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import { NextPageWithLayout } from "../_app";

function SystemPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [logLevel, setLogLevel] = useState("info");
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const toast = useToast();
  const {
    isOpen: isBackupOpen,
    onOpen: onBackupOpen,
    onClose: onBackupClose,
  } = useDisclosure();
  const {
    isOpen: isRestoreOpen,
    onOpen: onRestoreOpen,
    onClose: onRestoreClose,
  } = useDisclosure();

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "บันทึกการตั้งค่าระบบสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const systemStats = [
    {
      label: "CPU Usage",
      value: "45%",
      color: "green",
      icon: FiCpu,
      detail: "Intel Core i7-9700K",
    },
    {
      label: "Memory Usage",
      value: "6.2 GB",
      color: "blue",
      icon: FiHardDrive,
      detail: "จาก 16 GB ทั้งหมด",
    },
    {
      label: "Disk Usage",
      value: "234 GB",
      color: "orange",
      icon: FiDatabase,
      detail: "จาก 500 GB ทั้งหมด",
    },
    {
      label: "Network",
      value: "เชื่อมต่อ",
      color: "green",
      icon: FiWifi,
      detail: "100 Mbps",
    },
  ];

  const backupHistory = [
    {
      id: 1,
      date: "15/07/2025 02:00:00",
      size: "1.2 GB",
      status: "สำเร็จ",
      type: "อัตโนมัติ",
    },
    {
      id: 2,
      date: "14/07/2025 02:00:00",
      size: "1.1 GB",
      status: "สำเร็จ",
      type: "อัตโนมัติ",
    },
    {
      id: 3,
      date: "13/07/2025 14:30:00",
      size: "1.1 GB",
      status: "สำเร็จ",
      type: "ด้วยตนเอง",
    },
    {
      id: 4,
      date: "13/07/2025 02:00:00",
      size: "1.0 GB",
      status: "ล้มเหลว",
      type: "อัตโนมัติ",
    },
  ];

  const services = [
    {
      name: "Database Service",
      status: "running",
      uptime: "99.9%",
      lastRestart: "2 วันที่แล้ว",
    },
    {
      name: "Web Server",
      status: "running",
      uptime: "99.8%",
      lastRestart: "1 วันที่แล้ว",
    },
    {
      name: "Email Service",
      status: "running",
      uptime: "99.5%",
      lastRestart: "5 ชั่วโมงที่แล้ว",
    },
    {
      name: "Background Jobs",
      status: "running",
      uptime: "100%",
      lastRestart: "3 วันที่แล้ว",
    },
    {
      name: "File Storage",
      status: "stopped",
      uptime: "0%",
      lastRestart: "ไม่เคยเริ่ม",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <Heading size="lg" mb={2} fontFamily="heading">
          ระบบและเซิร์ฟเวอร์
        </Heading>
        <Text color="gray.600">
          จัดการการตั้งค่าระบบ ฐานข้อมูล และการดูแลเซิร์ฟเวอร์
        </Text>
      </Box>

      {/* System Health Alert */}
      <Alert status="success" borderRadius="md" mb={6}>
        <AlertIcon />
        <Box>
          <AlertTitle>ระบบทำงานปกติ!</AlertTitle>
          <AlertDescription>
            ระบบทั้งหมดทำงานอย่างเสถียร ไม่พบปัญหาใดๆ
          </AlertDescription>
        </Box>
      </Alert>

      {/* System Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {systemStats.map((stat, index) => (
          <Card key={index}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <Icon
                    as={stat.icon}
                    boxSize={6}
                    color={`${stat.color}.500`}
                  />
                  <Badge colorScheme={stat.color}>
                    {stat.label === "Network" ? "Online" : "Normal"}
                  </Badge>
                </HStack>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber color={`${stat.color}.500`}>
                  {stat.value}
                </StatNumber>
                <StatHelpText>{stat.detail}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Resource Usage */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiActivity} boxSize={5} />
            <Heading size="md">การใช้งานทรัพยากร</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="semibold">CPU</Text>
                <Text fontSize="sm" color="gray.600">
                  45%
                </Text>
              </HStack>
              <Progress
                value={45}
                colorScheme="green"
                size="lg"
                borderRadius="md"
              />
            </Box>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="semibold">Memory</Text>
                <Text fontSize="sm" color="gray.600">
                  6.2 GB / 16 GB
                </Text>
              </HStack>
              <Progress
                value={39}
                colorScheme="blue"
                size="lg"
                borderRadius="md"
              />
            </Box>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="semibold">Disk Space</Text>
                <Text fontSize="sm" color="gray.600">
                  234 GB / 500 GB
                </Text>
              </HStack>
              <Progress
                value={47}
                colorScheme="orange"
                size="lg"
                borderRadius="md"
              />
            </Box>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="semibold">Network I/O</Text>
                <HStack spacing={4}>
                  <HStack>
                    <Icon as={FiDownload} boxSize={4} color="blue.500" />
                    <Text fontSize="sm" color="gray.600">
                      1.2 MB/s
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiUpload} boxSize={4} color="green.500" />
                    <Text fontSize="sm" color="gray.600">
                      0.8 MB/s
                    </Text>
                  </HStack>
                </HStack>
              </HStack>
              <Progress
                value={25}
                colorScheme="cyan"
                size="lg"
                borderRadius="md"
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* System Services */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiMonitor} boxSize={5} />
            <Heading size="md">บริการระบบ</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>บริการ</Th>
                  <Th>สถานะ</Th>
                  <Th>Uptime</Th>
                  <Th>รีสตาร์ทล่าสุด</Th>
                  <Th>จัดการ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {services.map((service, index) => (
                  <Tr key={index}>
                    <Td fontWeight="semibold">{service.name}</Td>
                    <Td>
                      <HStack>
                        <Icon
                          as={
                            service.status === "running"
                              ? FiCheckCircle
                              : FiAlertCircle
                          }
                          color={
                            service.status === "running"
                              ? "green.500"
                              : "red.500"
                          }
                        />
                        <Badge
                          colorScheme={
                            service.status === "running" ? "green" : "red"
                          }
                        >
                          {service.status === "running"
                            ? "กำลังทำงาน"
                            : "หยุดทำงาน"}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td>{service.uptime}</Td>
                    <Td>{service.lastRestart}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" variant="ghost" colorScheme="orange">
                          <Icon as={FiRotateCcw} />
                        </Button>
                        <Button size="sm" variant="ghost" colorScheme="red">
                          <Icon as={FiTrash2} />
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* System Configuration */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiSettings} boxSize={5} />
            <Heading size="md">การกำหนดค่าระบบ</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">โหมดบำรุงรักษา</Text>
                <Text fontSize="sm" color="gray.600">
                  ปิดการเข้าถึงระบบชั่วคราวเพื่อบำรุงรักษา
                </Text>
              </VStack>
              <Switch
                isChecked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                colorScheme="orange"
                size="lg"
              />
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">สำรองข้อมูลอัตโนมัติ</Text>
                <Text fontSize="sm" color="gray.600">
                  สำรองข้อมูลทุกวันเวลา 02:00 น.
                </Text>
              </VStack>
              <Switch
                isChecked={autoBackup}
                onChange={(e) => setAutoBackup(e.target.checked)}
                colorScheme="green"
                size="lg"
              />
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">โหมด Debug</Text>
                <Text fontSize="sm" color="gray.600">
                  เปิดใช้งานการบันทึก log แบบละเอียด
                </Text>
              </VStack>
              <Switch
                isChecked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                colorScheme="red"
                size="lg"
              />
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">Cache System</Text>
                <Text fontSize="sm" color="gray.600">
                  เปิดใช้งานระบบ cache เพื่อเพิ่มประสิทธิภาพ
                </Text>
              </VStack>
              <Switch
                isChecked={cacheEnabled}
                onChange={(e) => setCacheEnabled(e.target.checked)}
                colorScheme="blue"
                size="lg"
              />
            </HStack>

            <Divider />

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>ระดับการบันทึก Log</FormLabel>
                <Select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                >
                  <option value="error">Error เท่านั้น</option>
                  <option value="warn">Warning และ Error</option>
                  <option value="info">Info, Warning และ Error</option>
                  <option value="debug">Debug ทั้งหมด</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>เวลาหมดอายุ Session (นาที)</FormLabel>
                <Input type="number" defaultValue="30" />
              </FormControl>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Backup Management */}
      <Card mb={6}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiDatabase} boxSize={5} />
              <Heading size="md">การจัดการสำรองข้อมูล</Heading>
            </HStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiDownload />}
                colorScheme="blue"
                onClick={onBackupOpen}
              >
                สำรองข้อมูลใหม่
              </Button>
              <Button
                leftIcon={<FiUpload />}
                variant="outline"
                onClick={onRestoreOpen}
              >
                กู้คืนข้อมูล
              </Button>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>วันที่และเวลา</Th>
                  <Th>ขนาดไฟล์</Th>
                  <Th>สถานะ</Th>
                  <Th>ประเภท</Th>
                  <Th>จัดการ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {backupHistory.map((backup) => (
                  <Tr key={backup.id}>
                    <Td fontFamily="mono" fontSize="sm">
                      {backup.date}
                    </Td>
                    <Td>{backup.size}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          backup.status === "สำเร็จ" ? "green" : "red"
                        }
                      >
                        {backup.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge variant="outline">{backup.type}</Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" variant="ghost" colorScheme="blue">
                          <Icon as={FiDownload} />
                        </Button>
                        <Button size="sm" variant="ghost" colorScheme="green">
                          <Icon as={FiRotateCcw} />
                        </Button>
                        <Button size="sm" variant="ghost" colorScheme="red">
                          <Icon as={FiTrash2} />
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Database Info */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiDatabase} boxSize={5} />
            <Heading size="md">ข้อมูลฐานข้อมูล</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="start" spacing={3}>
              <Text fontWeight="semibold">ข้อมูลการเชื่อมต่อ</Text>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  ประเภท:
                </Text>
                <Code>PostgreSQL 14.2</Code>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  เซิร์ฟเวอร์:
                </Text>
                <Code>localhost:5432</Code>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  ฐานข้อมูล:
                </Text>
                <Code>shopflow_production</Code>
              </Box>
            </VStack>

            <VStack align="start" spacing={3}>
              <Text fontWeight="semibold">สถิติการใช้งาน</Text>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm">จำนวนตาราง:</Text>
                <Badge>24 ตาราง</Badge>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm">ขนาดฐานข้อมูล:</Text>
                <Badge>1.2 GB</Badge>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm">การเชื่อมต่อที่ใช้งาน:</Text>
                <Badge colorScheme="green">8/100</Badge>
              </HStack>
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
                บันทึกการตั้งค่าระบบที่ได้เปลี่ยนแปลง
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

      {/* Backup Modal */}
      <Modal isOpen={isBackupOpen} onClose={onBackupClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiDownload} />
              <Text>สำรองข้อมูล</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>ประเภทการสำรองข้อมูล</FormLabel>
                <Select defaultValue="full">
                  <option value="full">สำรองข้อมูลทั้งหมด</option>
                  <option value="database">ฐานข้อมูลเท่านั้น</option>
                  <option value="files">ไฟล์เท่านั้น</option>
                  <option value="config">การตั้งค่าเท่านั้น</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>หมายเหตุ (ไม่บังคับ)</FormLabel>
                <Textarea
                  placeholder="ระบุหมายเหตุสำหรับการสำรองข้อมูลนี้"
                  rows={3}
                />
              </FormControl>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">คำแนะนำ</AlertTitle>
                  <AlertDescription fontSize="sm">
                    การสำรองข้อมูลทั้งหมดอาจใช้เวลา 5-10 นาที
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBackupClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={onBackupClose}>
              เริ่มสำรองข้อมูล
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Restore Modal */}
      <Modal isOpen={isRestoreOpen} onClose={onRestoreClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiUpload} />
              <Text>กู้คืนข้อมูล</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">คำเตือน!</AlertTitle>
                  <AlertDescription fontSize="sm">
                    การกู้คืนข้อมูลจะเขียนทับข้อมูลปัจจุบันทั้งหมด
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl>
                <FormLabel>เลือกไฟล์สำรองข้อมูล</FormLabel>
                <Input type="file" accept=".sql,.tar.gz,.zip" />
              </FormControl>

              <FormControl>
                <FormLabel>ประเภทการกู้คืน</FormLabel>
                <Select defaultValue="full">
                  <option value="full">กู้คืนทั้งหมด</option>
                  <option value="database">ฐานข้อมูลเท่านั้น</option>
                  <option value="files">ไฟล์เท่านั้น</option>
                  <option value="config">การตั้งค่าเท่านั้น</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>รหัสยืนยัน</FormLabel>
                <Input placeholder="ใส่ 'RESTORE' เพื่อยืนยัน" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRestoreClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="red" onClick={onRestoreClose}>
              เริ่มกู้คืนข้อมูล
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

const System: NextPageWithLayout = () => {
  return <SystemPage />;
};

System.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default withAuth(System);
