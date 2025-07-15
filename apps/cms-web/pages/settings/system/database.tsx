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
  StatArrow,
  Input,
  Select,
  Textarea,
  Switch,
  Divider,
  Code,
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
  IconButton,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiDownload,
  FiUpload,
  FiDatabase,
  FiHardDrive,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiSettings,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiTrendingUp,
  FiTrendingDown,
  FiServer,
} from "react-icons/fi";
import Link from "next/link";

interface DatabaseStatus {
  size: number;
  tables: number;
  records: number;
  connections: number;
  uptime: string;
  last_backup: string;
  performance_score: number;
}

interface BackupJob {
  id: string;
  name: string;
  type: "full" | "incremental" | "differential";
  schedule: string;
  last_run: string;
  next_run: string;
  status: "success" | "failed" | "running" | "pending";
  size: number;
  duration: number;
  auto_cleanup: boolean;
  retention_days: number;
}

const mockDatabaseStatus: DatabaseStatus = {
  size: 2.5, // GB
  tables: 45,
  records: 125000,
  connections: 8,
  uptime: "15d 6h 23m",
  last_backup: "2024-07-15T02:00:00Z",
  performance_score: 92,
};

const mockBackupJobs: BackupJob[] = [
  {
    id: "1",
    name: "Daily Full Backup",
    type: "full",
    schedule: "0 2 * * *", // Daily at 2 AM
    last_run: "2024-07-15T02:00:00Z",
    next_run: "2024-07-16T02:00:00Z",
    status: "success",
    size: 2.1,
    duration: 1800, // 30 minutes
    auto_cleanup: true,
    retention_days: 30,
  },
  {
    id: "2",
    name: "Hourly Incremental",
    type: "incremental",
    schedule: "0 * * * *", // Every hour
    last_run: "2024-07-15T14:00:00Z",
    next_run: "2024-07-15T15:00:00Z",
    status: "running",
    size: 0.05,
    duration: 300, // 5 minutes
    auto_cleanup: true,
    retention_days: 7,
  },
  {
    id: "3",
    name: "Weekly Differential",
    type: "differential",
    schedule: "0 1 * * 0", // Weekly on Sunday at 1 AM
    last_run: "2024-07-14T01:00:00Z",
    next_run: "2024-07-21T01:00:00Z",
    status: "success",
    size: 0.8,
    duration: 900, // 15 minutes
    auto_cleanup: true,
    retention_days: 90,
  },
];

function DatabasePage() {
  const toast = useToast();
  const [databaseStatus, setDatabaseStatus] =
    useState<DatabaseStatus>(mockDatabaseStatus);
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>(mockBackupJobs);
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [isRestoreRunning, setIsRestoreRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const [newBackupForm, setNewBackupForm] = useState({
    name: "",
    type: "full" as "full" | "incremental" | "differential",
    schedule: "",
    retention_days: 30,
    auto_cleanup: true,
  });

  const {
    isOpen: isBackupModalOpen,
    onOpen: onBackupModalOpen,
    onClose: onBackupModalClose,
  } = useDisclosure();

  const {
    isOpen: isRestoreModalOpen,
    onOpen: onRestoreModalOpen,
    onClose: onRestoreModalClose,
  } = useDisclosure();

  const {
    isOpen: isNewJobModalOpen,
    onOpen: onNewJobModalOpen,
    onClose: onNewJobModalClose,
  } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");

  const handleManualBackup = async () => {
    setIsBackupRunning(true);
    setBackupProgress(0);

    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackupRunning(false);
          toast({
            title: "สำรองข้อมูลสำเร็จ",
            description: "ข้อมูลได้ถูกสำรองไว้เรียบร้อยแล้ว",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    onBackupModalClose();
  };

  const handleRestore = async () => {
    setIsRestoreRunning(true);

    // Simulate restore process
    setTimeout(() => {
      setIsRestoreRunning(false);
      toast({
        title: "กู้คืนข้อมูลสำเร็จ",
        description: "ข้อมูลได้ถูกกู้คืนเรียบร้อยแล้ว",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onRestoreModalClose();
    }, 3000);
  };

  const handleCreateBackupJob = () => {
    if (!newBackupForm.name || !newBackupForm.schedule) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newJob: BackupJob = {
      id: Date.now().toString(),
      ...newBackupForm,
      last_run: "",
      next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      status: "pending",
      size: 0,
      duration: 0,
    };

    setBackupJobs((prev) => [...prev, newJob]);
    setNewBackupForm({
      name: "",
      type: "full",
      schedule: "",
      retention_days: 30,
      auto_cleanup: true,
    });
    onNewJobModalClose();

    toast({
      title: "สร้างงานสำรองข้อมูลสำเร็จ",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteBackupJob = (jobId: string) => {
    setBackupJobs((prev) => prev.filter((job) => job.id !== jobId));
    toast({
      title: "ลบงานสำรองข้อมูลสำเร็จ",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "green";
      case "failed":
        return "red";
      case "running":
        return "blue";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "สำเร็จ";
      case "failed":
        return "ล้มเหลว";
      case "running":
        return "กำลังทำงาน";
      case "pending":
        return "รอดำเนินการ";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "full":
        return "เต็มรูปแบบ";
      case "incremental":
        return "เพิ่มเติม";
      case "differential":
        return "ความแตกต่าง";
      default:
        return type;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatFileSize = (sizeInGB: number) => {
    if (sizeInGB < 1) {
      return `${(sizeInGB * 1024).toFixed(0)} MB`;
    }
    return `${sizeInGB.toFixed(2)} GB`;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "green";
    if (score >= 70) return "yellow";
    return "red";
  };

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
          <BreadcrumbLink>ฐานข้อมูล</BreadcrumbLink>
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
              จัดการฐานข้อมูล
            </Heading>
            <Text color="gray.600">
              ติดตามสถานะ สำรองข้อมูล และกู้คืนฐานข้อมูล
            </Text>
          </Box>
        </HStack>

        <HStack spacing={2}>
          <Button leftIcon={<FiRefreshCw />} variant="outline" size="sm">
            รีเฟรช
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            onClick={onBackupModalOpen}
            size="sm"
            isLoading={isBackupRunning}
          >
            สำรองข้อมูล
          </Button>
        </HStack>
      </HStack>

      {/* Database Status */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>ขนาดฐานข้อมูล</StatLabel>
              <StatNumber>{formatFileSize(databaseStatus.size)}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +2.3% จากเดือนที่แล้ว
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>จำนวนตาราง</StatLabel>
              <StatNumber>{databaseStatus.tables.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +3 ตารางใหม่
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>จำนวนเรคคอร์ด</StatLabel>
              <StatNumber>{databaseStatus.records.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +1,234 เรคคอร์ด
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>การเชื่อมต่อ</StatLabel>
              <StatNumber>{databaseStatus.connections}</StatNumber>
              <StatHelpText>
                <Icon as={FiServer} mr={1} />
                ออนไลน์: {databaseStatus.uptime}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Performance & Health */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        <Card>
          <CardHeader>
            <Heading size="md">ประสิทธิภาพของระบบ</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <CircularProgress
                value={databaseStatus.performance_score}
                color={getPerformanceColor(databaseStatus.performance_score)}
                size="120px"
                thickness="8px"
              >
                <CircularProgressLabel>
                  {databaseStatus.performance_score}%
                </CircularProgressLabel>
              </CircularProgress>

              <VStack spacing={2} w="100%">
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm">Query Performance</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    95%
                  </Text>
                </HStack>
                <Progress value={95} colorScheme="green" size="sm" w="100%" />

                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm">Memory Usage</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    68%
                  </Text>
                </HStack>
                <Progress value={68} colorScheme="yellow" size="sm" w="100%" />

                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm">Storage Usage</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    45%
                  </Text>
                </HStack>
                <Progress value={45} colorScheme="blue" size="sm" w="100%" />
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">การสำรองข้อมูลล่าสุด</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  สำรองล่าสุด
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {new Date(databaseStatus.last_backup).toLocaleString("th-TH")}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  ขนาดไฟล์สำรอง
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {formatFileSize(2.1)}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  สถานะ
                </Text>
                <Badge colorScheme="green" variant="solid">
                  สำเร็จ
                </Badge>
              </HStack>

              <Divider />

              {isBackupRunning && (
                <VStack spacing={2}>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm">กำลังสำรองข้อมูล...</Text>
                    <Text fontSize="sm">{Math.round(backupProgress)}%</Text>
                  </HStack>
                  <Progress
                    value={backupProgress}
                    colorScheme="blue"
                    size="sm"
                    w="100%"
                    isAnimated
                  />
                </VStack>
              )}

              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<FiDownload />}
                  colorScheme="blue"
                  onClick={onBackupModalOpen}
                  isLoading={isBackupRunning}
                  flex={1}
                >
                  สำรองข้อมูล
                </Button>
                <Button
                  size="sm"
                  leftIcon={<FiUpload />}
                  variant="outline"
                  onClick={onRestoreModalOpen}
                  isLoading={isRestoreRunning}
                  flex={1}
                >
                  กู้คืนข้อมูล
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Backup Jobs */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">งานสำรองข้อมูลอัตโนมัติ</Heading>
            <Button
              leftIcon={<FiPlay />}
              colorScheme="blue"
              size="sm"
              onClick={onNewJobModalOpen}
            >
              สร้างงานใหม่
            </Button>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ชื่องาน</Th>
                <Th>ประเภท</Th>
                <Th>ตารางเวลา</Th>
                <Th>สถานะ</Th>
                <Th>ครั้งล่าสุด</Th>
                <Th>ขนาด</Th>
                <Th>การดำเนินการ</Th>
              </Tr>
            </Thead>
            <Tbody>
              {backupJobs.map((job) => (
                <Tr key={job.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{job.name}</Text>
                      <Text fontSize="xs" color="gray.500">
                        เก็บ {job.retention_days} วัน
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge variant="outline">{getTypeLabel(job.type)}</Badge>
                  </Td>
                  <Td>
                    <Code fontSize="xs">{job.schedule}</Code>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(job.status)}
                      variant="solid"
                    >
                      {getStatusLabel(job.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      {job.last_run ? (
                        <>
                          <Text fontSize="sm">
                            {new Date(job.last_run).toLocaleDateString("th-TH")}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatDuration(job.duration)}
                          </Text>
                        </>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          ยังไม่ได้รัน
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>{job.size > 0 ? formatFileSize(job.size) : "-"}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label="รันทันที">
                        <IconButton
                          size="sm"
                          icon={<FiPlay />}
                          variant="ghost"
                          colorScheme="blue"
                          aria-label="รันทันที"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsBackupRunning(true);
                            setBackupProgress(0);
                            handleManualBackup();
                          }}
                        />
                      </Tooltip>
                      <Tooltip label="หยุดชั่วคราว">
                        <IconButton
                          size="sm"
                          icon={<FiPause />}
                          variant="ghost"
                          colorScheme="orange"
                          aria-label="หยุดชั่วคราว"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsBackupRunning(false);
                            toast({
                              title: "หยุดชั่วคราว",
                              description: "งานสำรองข้อมูลถูกหยุดชั่วคราว",
                              status: "info",
                              duration: 3000,
                              isClosable: true,
                            });
                          }}
                        />
                      </Tooltip>
                      <Tooltip label="ตั้งค่า">
                        <IconButton
                          size="sm"
                          icon={<FiSettings />}
                          variant="ghost"
                          colorScheme="gray"
                          aria-label="ตั้งค่า"
                          onClick={() => {
                            setSelectedJob(job);
                            onNewJobModalOpen();
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Manual Backup Modal */}
      <Modal isOpen={isBackupModalOpen} onClose={onBackupModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>สำรองข้อมูลฐานข้อมูล</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">การสำรองข้อมูลด้วยตนเอง</Text>
                  <Text fontSize="sm">
                    จะสร้างไฟล์สำรองข้อมูลเต็มรูปแบบของฐานข้อมูลทั้งหมด
                  </Text>
                </Box>
              </Alert>

              <FormControl>
                <FormLabel>ประเภทการสำรอง</FormLabel>
                <Select defaultValue="full">
                  <option value="full">เต็มรูปแบบ (Full Backup)</option>
                  <option value="incremental">เพิ่มเติม (Incremental)</option>
                  <option value="differential">
                    ความแตกต่าง (Differential)
                  </option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>คำอธิบาย (ไม่บังคับ)</FormLabel>
                <Textarea
                  placeholder="อธิบายการสำรองข้อมูลครั้งนี้..."
                  rows={3}
                />
              </FormControl>

              <VStack spacing={2} align="stretch">
                <Text fontSize="sm" fontWeight="medium">
                  ข้อมูลที่จะสำรอง:
                </Text>
                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontSize="sm">• ข้อมูลสินค้าและคลังสินค้า</Text>
                  <Text fontSize="sm">• ข้อมูลลูกค้าและคำสั่งซื้อ</Text>
                  <Text fontSize="sm">• การตั้งค่าระบบและผู้ใช้</Text>
                  <Text fontSize="sm">• รายงานและข้อมูลสถิติ</Text>
                </Box>
              </VStack>

              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  ขนาดไฟล์สำรองโดยประมาณ: {formatFileSize(databaseStatus.size)}
                  <br />
                  เวลาที่ใช้โดยประมาณ: 15-30 นาที
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBackupModalClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleManualBackup}
              isLoading={isBackupRunning}
            >
              เริ่มสำรองข้อมูล
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Restore Modal */}
      <Modal isOpen={isRestoreModalOpen} onClose={onRestoreModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>กู้คืนฐานข้อมูล</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">คำเตือน</Text>
                  <Text fontSize="sm">
                    การกู้คืนข้อมูลจะแทนที่ข้อมูลปัจจุบันทั้งหมด
                    กรุณาแน่ใจว่าได้สำรองข้อมูลปัจจุบันแล้ว
                  </Text>
                </Box>
              </Alert>

              <FormControl>
                <FormLabel>เลือกไฟล์สำรอง</FormLabel>
                <Input type="file" accept=".sql,.backup" />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  รองรับไฟล์ .sql และ .backup เท่านั้น
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>ตัวเลือกการกู้คืน</FormLabel>
                <VStack align="stretch" spacing={2}>
                  <Switch defaultChecked>
                    <Text fontSize="sm" ml={3}>
                      แทนที่ข้อมูลที่มีอยู่
                    </Text>
                  </Switch>
                  <Switch>
                    <Text fontSize="sm" ml={3}>
                      สร้างฐานข้อมูลใหม่
                    </Text>
                  </Switch>
                  <Switch>
                    <Text fontSize="sm" ml={3}>
                      ตรวจสอบความถูกต้องก่อนกู้คืน
                    </Text>
                  </Switch>
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRestoreModalClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="red"
              onClick={handleRestore}
              isLoading={isRestoreRunning}
            >
              เริ่มกู้คืนข้อมูล
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Backup Job Modal */}
      <Modal isOpen={isNewJobModalOpen} onClose={onNewJobModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>สร้างงานสำรองข้อมูลใหม่</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>ชื่องาน</FormLabel>
                <Input
                  placeholder="เช่น Daily Product Backup"
                  value={newBackupForm.name}
                  onChange={(e) =>
                    setNewBackupForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>ประเภทการสำรอง</FormLabel>
                <Select
                  value={newBackupForm.type}
                  onChange={(e) =>
                    setNewBackupForm((prev) => ({
                      ...prev,
                      type: e.target.value as
                        | "full"
                        | "incremental"
                        | "differential",
                    }))
                  }
                >
                  <option value="full">เต็มรูปแบบ (Full)</option>
                  <option value="incremental">เพิ่มเติม (Incremental)</option>
                  <option value="differential">
                    ความแตกต่าง (Differential)
                  </option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>ตารางเวลา (Cron Expression)</FormLabel>
                <Input
                  placeholder="0 2 * * * (ทุกวันเวลา 02:00)"
                  value={newBackupForm.schedule}
                  onChange={(e) =>
                    setNewBackupForm((prev) => ({
                      ...prev,
                      schedule: e.target.value,
                    }))
                  }
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  ตัวอย่าง: 0 2 * * * (ทุกวันเวลา 02:00), 0 */6 * * * (ทุก 6
                  ชั่วโมง)
                </Text>
              </FormControl>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>เก็บไว้ (วัน)</FormLabel>
                  <Input
                    type="number"
                    value={newBackupForm.retention_days}
                    onChange={(e) =>
                      setNewBackupForm((prev) => ({
                        ...prev,
                        retention_days: Number(e.target.value),
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>ลบอัตโนมัติ</FormLabel>
                  <Switch
                    isChecked={newBackupForm.auto_cleanup}
                    onChange={(e) =>
                      setNewBackupForm((prev) => ({
                        ...prev,
                        auto_cleanup: e.target.checked,
                      }))
                    }
                    mt={2}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNewJobModalClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={handleCreateBackupJob}>
              สร้างงาน
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

DatabasePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการฐานข้อมูล">{page}</Layout>;
};

export default withAuth(DatabasePage) as NextPageWithLayout;
