import React, { useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../_app";
import Layout from "../../../components/Layout";
import { withAuth } from "../../../lib/auth";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  useToast,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Input,
  Select,
  Textarea,
  Switch,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
  Code,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiSettings,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiServer,
  FiHardDrive,
  FiCpu,
  FiWifi,
  FiTool,
  FiPackage,
  FiUpload,
  FiDownload,
} from "react-icons/fi";
import Link from "next/link";

interface SystemStatus {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_status: "online" | "offline" | "degraded";
  uptime: string;
  last_update: string;
  pending_updates: number;
  maintenance_mode: boolean;
}

interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  category: "cleanup" | "optimization" | "security" | "update";
  frequency: "daily" | "weekly" | "monthly" | "manual";
  last_run: string | null;
  next_run: string | null;
  status: "pending" | "running" | "completed" | "failed";
  duration: number;
  auto_run: boolean;
}

interface UpdatePackage {
  id: string;
  name: string;
  current_version: string;
  new_version: string;
  type: "security" | "feature" | "bugfix";
  size: number;
  description: string;
  release_date: string;
  critical: boolean;
}

const mockSystemStatus: SystemStatus = {
  cpu_usage: 35,
  memory_usage: 68,
  disk_usage: 45,
  network_status: "online",
  uptime: "15d 6h 23m",
  last_update: "2024-07-10T09:30:00Z",
  pending_updates: 3,
  maintenance_mode: false,
};

const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: "1",
    name: "ล้างไฟล์ชั่วคราว",
    description: "ลบไฟล์ log และ cache ที่ไม่จำเป็น",
    category: "cleanup",
    frequency: "daily",
    last_run: "2024-07-15T02:00:00Z",
    next_run: "2024-07-16T02:00:00Z",
    status: "completed",
    duration: 300,
    auto_run: true,
  },
  {
    id: "2",
    name: "อัพเดทความปลอดภัย",
    description: "ติดตั้งแพทช์ความปลอดภัยล่าสุด",
    category: "security",
    frequency: "weekly",
    last_run: "2024-07-14T01:00:00Z",
    next_run: "2024-07-21T01:00:00Z",
    status: "pending",
    duration: 1800,
    auto_run: true,
  },
  {
    id: "3",
    name: "เพิ่มประสิทธิภาพฐานข้อมูล",
    description: "ปรับปรุงการทำงานของฐานข้อมูล",
    category: "optimization",
    frequency: "monthly",
    last_run: "2024-06-15T03:00:00Z",
    next_run: "2024-07-15T03:00:00Z",
    status: "running",
    duration: 3600,
    auto_run: true,
  },
];

const mockUpdates: UpdatePackage[] = [
  {
    id: "1",
    name: "Node.js Security Update",
    current_version: "18.16.0",
    new_version: "18.17.1",
    type: "security",
    size: 45.2,
    description: "แก้ไขช่องโหว่ความปลอดภัยที่สำคัญ",
    release_date: "2024-07-12T00:00:00Z",
    critical: true,
  },
  {
    id: "2",
    name: "Next.js Framework",
    current_version: "13.4.12",
    new_version: "13.4.19",
    type: "feature",
    size: 12.8,
    description: "ปรับปรุงประสิทธิภาพและเพิ่มฟีเจอร์ใหม่",
    release_date: "2024-07-10T00:00:00Z",
    critical: false,
  },
  {
    id: "3",
    name: "Chakra UI",
    current_version: "2.8.0",
    new_version: "2.8.2",
    type: "bugfix",
    size: 3.1,
    description: "แก้ไขบั๊กและปรับปรุงความเสถียร",
    release_date: "2024-07-08T00:00:00Z",
    critical: false,
  },
];

function MaintenancePage() {
  const toast = useToast();
  const [systemStatus, setSystemStatus] =
    useState<SystemStatus>(mockSystemStatus);
  const [maintenanceTasks, setMaintenanceTasks] =
    useState<MaintenanceTask[]>(mockMaintenanceTasks);
  const [updates, setUpdates] = useState<UpdatePackage[]>(mockUpdates);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null
  );
  const [selectedUpdates, setSelectedUpdates] = useState<string[]>([]);
  const [isMaintenanceModeChanging, setIsMaintenanceModeChanging] =
    useState(false);

  const {
    isOpen: isMaintenanceModalOpen,
    onOpen: onMaintenanceModalOpen,
    onClose: onMaintenanceModalClose,
  } = useDisclosure();

  const {
    isOpen: isUpdateModalOpen,
    onOpen: onUpdateModalOpen,
    onClose: onUpdateModalClose,
  } = useDisclosure();

  const {
    isOpen: isTaskModalOpen,
    onOpen: onTaskModalOpen,
    onClose: onTaskModalClose,
  } = useDisclosure();

  const handleMaintenanceMode = async (enable: boolean) => {
    setIsMaintenanceModeChanging(true);

    // Simulate API call
    setTimeout(() => {
      setSystemStatus((prev) => ({ ...prev, maintenance_mode: enable }));
      setIsMaintenanceModeChanging(false);
      toast({
        title: enable ? "เปิดโหมดบำรุงรักษาแล้ว" : "ปิดโหมดบำรุงรักษาแล้ว",
        description: enable
          ? "ระบบจะไม่สามารถใช้งานได้ชั่วคราว"
          : "ระบบกลับมาใช้งานได้ปกติแล้ว",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }, 1500);
  };

  const handleRunTask = (task: MaintenanceTask) => {
    setMaintenanceTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: "running" as const } : t
      )
    );

    // Simulate task completion
    setTimeout(() => {
      setMaintenanceTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: "completed" as const,
                last_run: new Date().toISOString(),
                next_run: getNextRunTime(t.frequency),
              }
            : t
        )
      );
      toast({
        title: "งานบำรุงรักษาเสร็จสิ้น",
        description: `${task.name} ทำงานเสร็จเรียบร้อยแล้ว`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 3000);
  };

  const handleInstallUpdates = () => {
    if (selectedUpdates.length === 0) {
      toast({
        title: "กรุณาเลือกการอัพเดท",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Simulate update installation
    setUpdates((prev) =>
      prev.filter((update) => !selectedUpdates.includes(update.id))
    );
    setSelectedUpdates([]);
    onUpdateModalClose();

    toast({
      title: "กำลังติดตั้งการอัพเดท",
      description: "ระบบจะรีสตาร์ทเมื่อติดตั้งเสร็จสิ้น",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  const getNextRunTime = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case "monthly":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "running":
        return "blue";
      case "failed":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "เสร็จสิ้น";
      case "running":
        return "กำลังทำงาน";
      case "failed":
        return "ล้มเหลว";
      case "pending":
        return "รอดำเนินการ";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "cleanup":
        return "ทำความสะอาด";
      case "optimization":
        return "เพิ่มประสิทธิภาพ";
      case "security":
        return "ความปลอดภัย";
      case "update":
        return "อัพเดท";
      default:
        return category;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "security":
        return "red";
      case "feature":
        return "blue";
      case "bugfix":
        return "green";
      default:
        return "gray";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "security":
        return "ความปลอดภัย";
      case "feature":
        return "ฟีเจอร์ใหม่";
      case "bugfix":
        return "แก้ไขบั๊ก";
      default:
        return type;
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1024) {
      return `${sizeInMB.toFixed(1)} MB`;
    }
    return `${(sizeInMB / 1024).toFixed(2)} GB`;
  };

  const getHealthColor = (usage: number) => {
    if (usage >= 90) return "red";
    if (usage >= 70) return "yellow";
    return "green";
  };

  const criticalUpdates = updates.filter((update) => update.critical).length;
  const runningTasks = maintenanceTasks.filter(
    (task) => task.status === "running"
  ).length;

  return (
    <Box>
      {/* Breadcrumb */}
      <Breadcrumb mb={6} fontSize="sm">
        <BreadcrumbItem>
          <Link href="/settings">
            <BreadcrumbLink>ตั้งค่าระบบ</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/settings/system">
            <BreadcrumbLink>ระบบ</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>บำรุงรักษา</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <HStack spacing={4}>
          <Link href="/settings/system">
            <Button variant="ghost" leftIcon={<FiArrowLeft />} size="sm">
              กลับ
            </Button>
          </Link>
          <Box>
            <Heading size="lg" fontFamily="heading">
              บำรุงรักษาระบบ
            </Heading>
            <Text color="gray.600">
              ติดตามสถานะระบบ รันงานบำรุงรักษา และจัดการการอัพเดท
            </Text>
          </Box>
        </HStack>

        <HStack spacing={2}>
          <Button
            leftIcon={systemStatus.maintenance_mode ? <FiPlay /> : <FiPause />}
            colorScheme={systemStatus.maintenance_mode ? "green" : "orange"}
            variant="outline"
            size="sm"
            onClick={() =>
              handleMaintenanceMode(!systemStatus.maintenance_mode)
            }
            isLoading={isMaintenanceModeChanging}
          >
            {systemStatus.maintenance_mode
              ? "ปิดโหมดบำรุงรักษา"
              : "เปิดโหมดบำรุงรักษา"}
          </Button>
          <Button leftIcon={<FiRefreshCw />} variant="outline" size="sm">
            รีเฟรช
          </Button>
        </HStack>
      </HStack>

      {/* Maintenance Mode Alert */}
      {systemStatus.maintenance_mode && (
        <Alert status="warning" borderRadius="lg" mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">โหมดบำรุงรักษา</Text>
            <Text fontSize="sm">
              ระบบอยู่ในโหมดบำรุงรักษา ผู้ใช้ไม่สามารถเข้าถึงระบบได้ชั่วคราว
            </Text>
          </Box>
        </Alert>
      )}

      {/* System Status */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>การใช้งาน CPU</StatLabel>
              <StatNumber>{systemStatus.cpu_usage}%</StatNumber>
              <Progress
                value={systemStatus.cpu_usage}
                colorScheme={getHealthColor(systemStatus.cpu_usage)}
                size="sm"
                mt={2}
              />
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>การใช้งาน Memory</StatLabel>
              <StatNumber>{systemStatus.memory_usage}%</StatNumber>
              <Progress
                value={systemStatus.memory_usage}
                colorScheme={getHealthColor(systemStatus.memory_usage)}
                size="sm"
                mt={2}
              />
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>การใช้งาน Disk</StatLabel>
              <StatNumber>{systemStatus.disk_usage}%</StatNumber>
              <Progress
                value={systemStatus.disk_usage}
                colorScheme={getHealthColor(systemStatus.disk_usage)}
                size="sm"
                mt={2}
              />
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Uptime</StatLabel>
              <StatNumber fontSize="lg">{systemStatus.uptime}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <Icon
                    as={FiWifi}
                    color={
                      systemStatus.network_status === "online"
                        ? "green.500"
                        : "red.500"
                    }
                  />
                  <Text>
                    {systemStatus.network_status === "online"
                      ? "ออนไลน์"
                      : "ออฟไลน์"}
                  </Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  งานที่กำลังทำงาน
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {runningTasks}
                </Text>
              </Box>
              <Icon as={FiSettings} boxSize={8} color="blue.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  การอัพเดทที่รอ
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {updates.length}
                </Text>
              </Box>
              <Icon as={FiPackage} boxSize={8} color="orange.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  อัพเดทสำคัญ
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {criticalUpdates}
                </Text>
              </Box>
              <Icon as={FiAlertTriangle} boxSize={8} color="red.500" />
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Maintenance Tasks */}
      <Card mb={6}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">งานบำรุงรักษา</Heading>
            <Button
              leftIcon={<FiTool />}
              colorScheme="blue"
              size="sm"
              onClick={onTaskModalOpen}
            >
              สร้างงานใหม่
            </Button>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>งาน</Th>
                <Th>หมวดหมู่</Th>
                <Th>ความถี่</Th>
                <Th>สถานะ</Th>
                <Th>ครั้งล่าสุด</Th>
                <Th>ครั้งถัดไป</Th>
                <Th>การดำเนินการ</Th>
              </Tr>
            </Thead>
            <Tbody>
              {maintenanceTasks.map((task) => (
                <Tr key={task.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{task.name}</Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {task.description}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Tag size="sm" variant="outline">
                      <TagLabel>{getCategoryLabel(task.category)}</TagLabel>
                    </Tag>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{task.frequency}</Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(task.status)}
                      variant="solid"
                    >
                      {getStatusLabel(task.status)}
                    </Badge>
                  </Td>
                  <Td>
                    {task.last_run ? (
                      <Text fontSize="sm">
                        {new Date(task.last_run).toLocaleDateString("th-TH")}
                      </Text>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        ยังไม่ได้รัน
                      </Text>
                    )}
                  </Td>
                  <Td>
                    {task.next_run ? (
                      <Text fontSize="sm">
                        {new Date(task.next_run).toLocaleDateString("th-TH")}
                      </Text>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        ด้วยตนเอง
                      </Text>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label="รันทันที">
                        <Button
                          size="sm"
                          leftIcon={<FiPlay />}
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleRunTask(task)}
                          isDisabled={task.status === "running"}
                        >
                          รัน
                        </Button>
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Available Updates */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="md">การอัพเดทที่พร้อมใช้งาน</Heading>
              {criticalUpdates > 0 && (
                <HStack spacing={1}>
                  <Icon as={FiAlertTriangle} color="red.500" />
                  <Text fontSize="sm" color="red.500">
                    มี {criticalUpdates} การอัพเดทสำคัญ
                  </Text>
                </HStack>
              )}
            </VStack>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="blue"
              size="sm"
              onClick={onUpdateModalOpen}
              isDisabled={updates.length === 0}
            >
              ติดตั้งการอัพเดท
            </Button>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>แพ็คเกจ</Th>
                <Th>เวอร์ชันปัจจุบัน</Th>
                <Th>เวอร์ชันใหม่</Th>
                <Th>ประเภท</Th>
                <Th>ขนาด</Th>
                <Th>วันที่ปล่อย</Th>
                <Th>สำคัญ</Th>
              </Tr>
            </Thead>
            <Tbody>
              {updates.map((update) => (
                <Tr key={update.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{update.name}</Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {update.description}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Code fontSize="sm">{update.current_version}</Code>
                  </Td>
                  <Td>
                    <Code fontSize="sm" colorScheme="green">
                      {update.new_version}
                    </Code>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getTypeColor(update.type)}
                      variant="solid"
                    >
                      {getTypeLabel(update.type)}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{formatFileSize(update.size)}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {new Date(update.release_date).toLocaleDateString(
                        "th-TH"
                      )}
                    </Text>
                  </Td>
                  <Td>
                    {update.critical && (
                      <Badge colorScheme="red" variant="solid">
                        สำคัญ
                      </Badge>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Install Updates Modal */}
      <Modal isOpen={isUpdateModalOpen} onClose={onUpdateModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ติดตั้งการอัพเดท</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">คำเตือน</Text>
                  <Text fontSize="sm">
                    การติดตั้งการอัพเดทอาจทำให้ระบบหยุดทำงานชั่วคราว
                    กรุณาแจ้งผู้ใช้ล่วงหน้า
                  </Text>
                </Box>
              </Alert>

              <FormControl>
                <FormLabel>เลือกการอัพเดทที่ต้องการติดตั้ง</FormLabel>
                <VStack align="stretch" spacing={2}>
                  {updates.map((update) => (
                    <HStack
                      key={update.id}
                      justify="space-between"
                      p={3}
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <HStack spacing={3}>
                        <Switch
                          isChecked={selectedUpdates.includes(update.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUpdates((prev) => [
                                ...prev,
                                update.id,
                              ]);
                            } else {
                              setSelectedUpdates((prev) =>
                                prev.filter((id) => id !== update.id)
                              );
                            }
                          }}
                        />
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Text fontWeight="semibold">{update.name}</Text>
                            {update.critical && (
                              <Badge colorScheme="red" size="sm">
                                สำคัญ
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {update.current_version} → {update.new_version}
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {formatFileSize(update.size)}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </FormControl>

              {selectedUpdates.length > 0 && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    จะติดตั้ง {selectedUpdates.length} การอัพเดท ขนาดรวม:{" "}
                    {formatFileSize(
                      updates
                        .filter((u) => selectedUpdates.includes(u.id))
                        .reduce((sum, u) => sum + u.size, 0)
                    )}
                  </Text>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUpdateModalClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleInstallUpdates}
              isDisabled={selectedUpdates.length === 0}
            >
              ติดตั้งการอัพเดท
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Task Modal - Placeholder */}
      <Modal isOpen={isTaskModalOpen} onClose={onTaskModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>สร้างงานบำรุงรักษาใหม่</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>ฟีเจอร์นี้จะเปิดให้ใช้งานในอนาคต</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onTaskModalClose}>ปิด</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

MaintenancePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="บำรุงรักษาระบบ">{page}</Layout>;
};

export default withAuth(MaintenancePage) as NextPageWithLayout;
