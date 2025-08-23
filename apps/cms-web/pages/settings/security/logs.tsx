import React, { useState, useEffect } from "react";
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
  Input,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Tooltip,
  Tag,
  TagLabel,
  Skeleton,
  Spacer,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiMoreVertical,
  FiShield,
  FiAlertTriangle,
  FiUser,
  FiKey,
  FiSettings,
  FiRefreshCw,
  FiClock,
  FiMapPin,
  FiMonitor,
} from "react-icons/fi";
import Link from "next/link";
import { useSecurityLogs } from "../../../lib/hooks/useSecurity";

const logActions = [
  { value: "login", label: "เข้าสู่ระบบ" },
  { value: "logout", label: "ออกจากระบบ" },
  { value: "password_change", label: "เปลี่ยนรหัสผ่าน" },
  { value: "api_key_create", label: "สร้าง API Key" },
  { value: "api_key_delete", label: "ลบ API Key" },
  { value: "user_create", label: "สร้างผู้ใช้" },
  { value: "user_delete", label: "ลบผู้ใช้" },
  { value: "role_change", label: "เปลี่ยนบทบาท" },
  { value: "settings_change", label: "เปลี่ยนการตั้งค่า" },
  { value: "data_export", label: "ส่งออกข้อมูล" },
];

function SecurityLogsPage() {
  const toast = useToast();
  const { logs, loading, error, refresh } = useSecurityLogs();
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [successFilter, setSuccessFilter] = useState("");
  const [dateRange, setDateRange] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");

  // Apply filters to logs
  useEffect(() => {
    let result = [...logs];

    if (searchTerm) {
      result = result.filter(
        (log) =>
          log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter) {
      result = result.filter((log) => log.action === actionFilter);
    }

    if (riskFilter) {
      result = result.filter((log) => log.risk_level === riskFilter);
    }

    if (successFilter) {
      const isSuccess = successFilter === "success";
      result = result.filter((log) => log.success === isSuccess);
    }

    setFilteredLogs(result);
  }, [logs, searchTerm, actionFilter, riskFilter, successFilter]);

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    onOpen();
  };

  const handleExportLogs = () => {
    // In a real implementation, this would export the logs to a file
    toast({
      title: "ส่งออกบันทึกความปลอดภัย",
      description: "กำลังเตรียมไฟล์สำหรับดาวน์โหลด",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refresh();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดบันทึกความปลอดภัยได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    handleExportLogs();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActionFilter("");
    setRiskFilter("");
    setSuccessFilter("");
    setDateRange("");
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "green";
      case "medium":
        return "yellow";
      case "high":
        return "orange";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "ต่ำ";
      case "medium":
        return "ปานกลาง";
      case "high":
        return "สูง";
      case "critical":
        return "วิกฤต";
      default:
        return "ไม่ทราบ";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
        return <FiUser />;
      case "logout":
        return <FiUser />;
      case "password_change":
        return <FiKey />;
      case "api_key_create":
        return <FiKey />;
      case "api_key_delete":
        return <FiKey />;
      case "user_create":
        return <FiUser />;
      case "user_delete":
        return <FiUser />;
      case "role_change":
        return <FiSettings />;
      case "settings_change":
        return <FiSettings />;
      case "data_export":
        return <FiDownload />;
      default:
        return <FiShield />;
    }
  };

  // Statistics
  const totalLogs = filteredLogs.length;
  const failedLogins = filteredLogs.filter(
    (log) => log.action === "login" && !log.success
  ).length;
  const highRiskEvents = filteredLogs.filter(
    (log) => log.risk_level === "high" || log.risk_level === "critical"
  ).length;
  const uniqueUsers = new Set(filteredLogs.map((log) => log.user_id)).size;

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
          <Link href="/settings/security">
            <BreadcrumbLink>ความปลอดภัย</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Security Logs</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <HStack spacing={4}>
          <Link href="/settings/security">
            <Button variant="ghost" leftIcon={<FiArrowLeft />} size="sm">
              กลับ
            </Button>
          </Link>
          <Box>
            <Heading size="lg" fontFamily="heading">
              บันทึกความปลอดภัย
            </Heading>
            <Text color="gray.600">
              ติดตามกิจกรรมและเหตุการณ์ความปลอดภัยในระบบ
            </Text>
          </Box>
        </HStack>

        <HStack spacing={2}>
          <Button
            leftIcon={<FiRefreshCw />}
            variant="outline"
            onClick={handleRefresh}
            isLoading={isLoading}
            size="sm"
          >
            รีเฟรช
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            onClick={handleExport}
            size="sm"
          >
            ส่งออก
          </Button>
        </HStack>
      </HStack>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  บันทึกทั้งหมด
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {totalLogs}
                </Text>
              </Box>
              <Icon as={FiShield} boxSize={8} color="blue.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  การเข้าสู่ระบบล้มเหลว
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {failedLogins}
                </Text>
              </Box>
              <Icon as={FiAlertTriangle} boxSize={8} color="red.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  เหตุการณ์เสี่ยงสูง
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {highRiskEvents}
                </Text>
              </Box>
              <Icon as={FiAlertTriangle} boxSize={8} color="orange.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  ผู้ใช้ที่ใช้งาน
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {uniqueUsers}
                </Text>
              </Box>
              <Icon as={FiUser} boxSize={8} color="purple.500" />
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Card mb={6}>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              ตัวกรอง
            </Text>
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              ล้างตัวกรอง
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3, lg: 6 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">ค้นหา</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <FiSearch />
                </InputLeftElement>
                <Input
                  placeholder="ชื่อผู้ใช้, อีเมล, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">การกระทำ</FormLabel>
              <Select
                placeholder="ทั้งหมด"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                size="sm"
              >
                {logActions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">ระดับความเสี่ยง</FormLabel>
              <Select
                placeholder="ทั้งหมด"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                size="sm"
              >
                <option value="low">ต่ำ</option>
                <option value="medium">ปานกลาง</option>
                <option value="high">สูง</option>
                <option value="critical">วิกฤต</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">สถานะ</FormLabel>
              <Select
                placeholder="ทั้งหมด"
                value={successFilter}
                onChange={(e) => setSuccessFilter(e.target.value)}
                size="sm"
              >
                <option value="success">สำเร็จ</option>
                <option value="failed">ล้มเหลว</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">ช่วงเวลา</FormLabel>
              <Select
                placeholder="ทั้งหมด"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                size="sm"
              >
                <option value="today">วันนี้</option>
                <option value="week">7 วันที่ผ่านมา</option>
                <option value="month">30 วันที่ผ่านมา</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Security Logs Table */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              บันทึกความปลอดภัย ({filteredLogs.length} รายการ)
            </Text>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          {isLoading ? (
            <VStack spacing={4} p={6}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="60px" width="100%" />
              ))}
            </VStack>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>วันเวลา</Th>
                  <Th>ผู้ใช้</Th>
                  <Th>การกระทำ</Th>
                  <Th>IP Address & สถานที่</Th>
                  <Th>สถานะ</Th>
                  <Th>ความเสี่ยง</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredLogs.map((log) => (
                  <Tr key={log.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {new Date(log.timestamp).toLocaleDateString("th-TH")}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(log.timestamp).toLocaleTimeString("th-TH")}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {log.user_name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {log.user_email}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Icon
                          as={() => getActionIcon(log.action)}
                          color="gray.500"
                        />
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {logActions.find((a) => a.value === log.action)
                              ?.label || log.action}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {log.resource}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack spacing={1}>
                          <Icon as={FiMonitor} color="gray.500" boxSize={3} />
                          <Text fontSize="sm">{log.ip_address}</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={FiMapPin} color="gray.500" boxSize={3} />
                          <Text fontSize="xs" color="gray.500">
                            {log.location}
                          </Text>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={log.success ? "green" : "red"}
                        variant="solid"
                      >
                        {log.success ? "สำเร็จ" : "ล้มเหลว"}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getRiskColor(log.risk_level)}
                        variant="solid"
                      >
                        {getRiskLabel(log.risk_level)}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEye />}
                            onClick={() => handleViewDetails(log)}
                          >
                            ดูรายละเอียด
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Log Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>รายละเอียดบันทึกความปลอดภัย</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLog && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      วันเวลา
                    </Text>
                    <Text>
                      {new Date(selectedLog.timestamp).toLocaleString("th-TH")}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      สถานะ
                    </Text>
                    <Badge
                      colorScheme={selectedLog.success ? "green" : "red"}
                      variant="solid"
                    >
                      {selectedLog.success ? "สำเร็จ" : "ล้มเหลว"}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      ผู้ใช้
                    </Text>
                    <Text>{selectedLog.user_name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {selectedLog.user_email}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      ระดับความเสี่ยง
                    </Text>
                    <Badge
                      colorScheme={getRiskColor(selectedLog.risk_level)}
                      variant="solid"
                    >
                      {getRiskLabel(selectedLog.risk_level)}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      การกระทำ
                    </Text>
                    <Text>
                      {logActions.find((a) => a.value === selectedLog.action)
                        ?.label || selectedLog.action}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      ทรัพยากร
                    </Text>
                    <Text>{selectedLog.resource}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      IP Address
                    </Text>
                    <Text>{selectedLog.ip_address}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      สถานที่
                    </Text>
                    <Text>{selectedLog.location}</Text>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="medium"
                    mb={2}
                  >
                    User Agent
                  </Text>
                  <Text fontSize="sm" bg="gray.50" p={2} borderRadius="md">
                    {selectedLog.user_agent}
                  </Text>
                </Box>

                {selectedLog.details && (
                  <Box>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      fontWeight="medium"
                      mb={2}
                    >
                      รายละเอียดเพิ่มเติม
                    </Text>
                    <Box bg="gray.50" p={3} borderRadius="md">
                      <pre style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </Box>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>ปิด</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

SecurityLogsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="บันทึกความปลอดภัย">{page}</Layout>;
};

export default withAuth(SecurityLogsPage) as NextPageWithLayout;
