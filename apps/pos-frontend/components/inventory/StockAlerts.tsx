import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  useColorModeValue,
  Collapse,
  useDisclosure,
  Flex,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
  Avatar,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  IoWarning,
  IoAlertCircle,
  IoCheckmarkCircle,
  IoClose,
  IoChevronDown,
  IoChevronUp,
  IoFilter,
  IoRefresh,
  IoEye,
  IoCheckmark,
  IoTime,
  IoSearch,
  IoNotifications,
  IoNotificationsOff,
  IoEllipsisVertical,
  IoDownload,
  IoSettings,
} from "react-icons/io5";
import { StockAlert, AlertLevel } from "../../lib/stock";
import { formatCurrency } from "../../lib/sales";

interface StockAlertsProps {
  alerts: StockAlert[];
  onAcknowledge?: (alertId: string) => void;
  onAcknowledgeAll?: () => void;
  onDismiss?: (alertId: string) => void;
  onRefresh?: () => void;
  onViewProduct?: (productId: string) => void;
  isLoading?: boolean;
  compact?: boolean;
  maxHeight?: string;
  showActions?: boolean;
  showFilters?: boolean;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({
  alerts,
  onAcknowledge,
  onAcknowledgeAll,
  onDismiss,
  onRefresh,
  onViewProduct,
  isLoading = false,
  compact = false,
  maxHeight = "400px",
  showActions = true,
  showFilters = true,
}) => {
  const [filterLevel, setFilterLevel] = useState<AlertLevel | "all">("all");
  const [filterAcknowledged, setFilterAcknowledged] = useState<"all" | "acknowledged" | "unacknowledged">("unacknowledged");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<StockAlert | null>(null);

  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isFiltersOpen, onToggle: onFiltersToggle } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesLevel = filterLevel === "all" || alert.level === filterLevel;
    const matchesAcknowledged = 
      filterAcknowledged === "all" ||
      (filterAcknowledged === "acknowledged" && alert.acknowledged) ||
      (filterAcknowledged === "unacknowledged" && !alert.acknowledged);
    const matchesSearch = 
      !searchTerm ||
      alert.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.productSku.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLevel && matchesAcknowledged && matchesSearch;
  });

  // Group alerts by level
  const alertsByLevel = {
    critical: filteredAlerts.filter(a => a.level === "critical" && !a.acknowledged),
    error: filteredAlerts.filter(a => a.level === "error" && !a.acknowledged),
    warning: filteredAlerts.filter(a => a.level === "warning" && !a.acknowledged),
    info: filteredAlerts.filter(a => a.level === "info" && !a.acknowledged),
  };

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case "critical":
      case "error":
        return IoAlertCircle;
      case "warning":
        return IoWarning;
      case "info":
        return IoCheckmarkCircle;
      default:
        return IoWarning;
    }
  };

  const getAlertColor = (level: AlertLevel) => {
    switch (level) {
      case "critical":
        return "red";
      case "error":
        return "red";
      case "warning":
        return "orange";
      case "info":
        return "blue";
      default:
        return "gray";
    }
  };

  const handleViewDetails = (alert: StockAlert) => {
    setSelectedAlert(alert);
    onDetailsOpen();
  };

  const handleAcknowledge = (alertId: string) => {
    onAcknowledge?.(alertId);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (compact) {
    const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
    const criticalCount = alertsByLevel.critical.length;

    if (unacknowledgedCount === 0) {
      return (
        <Badge colorScheme="green" variant="subtle" p={2}>
          <HStack spacing={1}>
            <IoCheckmarkCircle />
            <Text fontSize="xs">สต็อกปกติ</Text>
          </HStack>
        </Badge>
      );
    }

    return (
      <Menu>
        <MenuButton>
          <Badge
            colorScheme={criticalCount > 0 ? "red" : "orange"}
            variant="solid"
            p={2}
            cursor="pointer"
            _hover={{ opacity: 0.8 }}
          >
            <HStack spacing={1}>
              <IoWarning />
              <Text fontSize="xs">{unacknowledgedCount} แจ้งเตือน</Text>
            </HStack>
          </Badge>
        </MenuButton>
        <MenuList maxH="300px" overflowY="auto">
          {filteredAlerts.slice(0, 5).map(alert => (
            <MenuItem key={alert.id} onClick={() => handleViewDetails(alert)}>
              <VStack align="start" spacing={1} w="full">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                    {alert.productName}
                  </Text>
                  <Badge size="sm" colorScheme={getAlertColor(alert.level)}>
                    {alert.level}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {alert.message}
                </Text>
              </VStack>
            </MenuItem>
          ))}
          {filteredAlerts.length > 5 && (
            <MenuItem fontSize="xs" color="gray.500">
              และอีก {filteredAlerts.length - 5} รายการ...
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    );
  }

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <IoNotifications />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">แจ้งเตือนสต็อก</Text>
              <Text fontSize="sm" color="gray.500">
                {filteredAlerts.filter(a => !a.acknowledged).length} รายการที่ยังไม่อ่าน
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={2}>
            {showFilters && (
              <IconButton
                aria-label="Toggle filters"
                icon={isFiltersOpen ? <IoChevronUp /> : <IoChevronDown />}
                size="sm"
                variant="ghost"
                onClick={onFiltersToggle}
              />
            )}
            {onRefresh && (
              <IconButton
                aria-label="Refresh alerts"
                icon={<IoRefresh />}
                size="sm"
                variant="ghost"
                onClick={onRefresh}
                isLoading={isLoading}
              />
            )}
            {showActions && onAcknowledgeAll && (
              <Button
                size="sm"
                leftIcon={<IoCheckmark />}
                onClick={onAcknowledgeAll}
                isDisabled={filteredAlerts.filter(a => !a.acknowledged).length === 0}
              >
                อ่านทั้งหมด
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Filters */}
        <Collapse in={isFiltersOpen}>
          <VStack spacing={3} mt={4} align="stretch">
            <HStack spacing={4}>
              <InputGroup maxW="200px">
                <InputLeftElement>
                  <IoSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="ค้นหาสินค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
                />
              </InputGroup>

              <Select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as any)}
                size="sm"
                maxW="150px"
              >
                <option value="all">ทุกระดับ</option>
                <option value="critical">วิกฤต</option>
                <option value="error">ข้อผิดพลาด</option>
                <option value="warning">คำเตือน</option>
                <option value="info">ข้อมูล</option>
              </Select>

              <Select
                value={filterAcknowledged}
                onChange={(e) => setFilterAcknowledged(e.target.value as any)}
                size="sm"
                maxW="150px"
              >
                <option value="unacknowledged">ยังไม่อ่าน</option>
                <option value="acknowledged">อ่านแล้ว</option>
                <option value="all">ทั้งหมด</option>
              </Select>
            </HStack>

            {/* Quick Stats */}
            <SimpleGrid columns={4} spacing={2}>
              <Card size="sm" variant="outline" bg="red.50">
                <CardBody p={2} textAlign="center">
                  <Text fontSize="xs" color="gray.600">วิกฤต</Text>
                  <Text fontSize="lg" fontWeight="bold" color="red.600">
                    {alertsByLevel.critical.length}
                  </Text>
                </CardBody>
              </Card>
              <Card size="sm" variant="outline" bg="orange.50">
                <CardBody p={2} textAlign="center">
                  <Text fontSize="xs" color="gray.600">คำเตือน</Text>
                  <Text fontSize="lg" fontWeight="bold" color="orange.600">
                    {alertsByLevel.warning.length}
                  </Text>
                </CardBody>
              </Card>
              <Card size="sm" variant="outline" bg="blue.50">
                <CardBody p={2} textAlign="center">
                  <Text fontSize="xs" color="gray.600">ข้อมูล</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    {alertsByLevel.info.length}
                  </Text>
                </CardBody>
              </Card>
              <Card size="sm" variant="outline" bg="green.50">
                <CardBody p={2} textAlign="center">
                  <Text fontSize="xs" color="gray.600">อ่านแล้ว</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.600">
                    {alerts.filter(a => a.acknowledged).length}
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Collapse>
      </CardHeader>

      <CardBody>
        <VStack spacing={3} align="stretch" maxH={maxHeight} overflowY="auto">
          {filteredAlerts.length === 0 ? (
            <Box textAlign="center" py={8} color="gray.500">
              <IoCheckmarkCircle size={48} />
              <Text mt={2}>ไม่มีการแจ้งเตือน</Text>
            </Box>
          ) : (
            filteredAlerts.map(alert => {
              const AlertIcon = getAlertIcon(alert.level);
              const colorScheme = getAlertColor(alert.level);

              return (
                <Alert
                  key={alert.id}
                  status={alert.level === "critical" || alert.level === "error" ? "error" : 
                         alert.level === "warning" ? "warning" : "info"}
                  borderRadius="md"
                  opacity={alert.acknowledged ? 0.6 : 1}
                >
                  <AlertIcon />
                  <Box flex="1">
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1} flex="1">
                        <HStack spacing={2}>
                          <AlertTitle fontSize="sm">
                            {alert.productName}
                          </AlertTitle>
                          <Badge size="sm" colorScheme={colorScheme}>
                            {alert.level}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge size="sm" colorScheme="green" variant="outline">
                              อ่านแล้ว
                            </Badge>
                          )}
                        </HStack>
                        <AlertDescription fontSize="xs">
                          {alert.message}
                        </AlertDescription>
                        <HStack fontSize="xs" color="gray.500" spacing={3}>
                          <Text>SKU: {alert.productSku}</Text>
                          <Text>สต็อก: {alert.currentStock}</Text>
                          <Text>{formatDate(alert.createdAt)}</Text>
                        </HStack>
                      </VStack>

                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<IoEllipsisVertical />}
                          size="sm"
                          variant="ghost"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<IoEye />}
                            onClick={() => handleViewDetails(alert)}
                          >
                            ดูรายละเอียด
                          </MenuItem>
                          {onViewProduct && (
                            <MenuItem
                              icon={<IoEye />}
                              onClick={() => onViewProduct(alert.productId)}
                            >
                              ดูสินค้า
                            </MenuItem>
                          )}
                          {showActions && !alert.acknowledged && onAcknowledge && (
                            <MenuItem
                              icon={<IoCheckmark />}
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              ทำเครื่องหมายว่าอ่านแล้ว
                            </MenuItem>
                          )}
                          {showActions && onDismiss && (
                            <MenuItem
                              icon={<IoClose />}
                              color="red.500"
                              onClick={() => onDismiss(alert.id)}
                            >
                              ยกเลิก
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    </HStack>
                  </Box>
                </Alert>
              );
            })
          )}
        </VStack>
      </CardBody>

      {/* Alert Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <IoWarning />
              <Text>รายละเอียดการแจ้งเตือน</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {selectedAlert && (
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold" fontSize="lg">
                          {selectedAlert.productName}
                        </Text>
                        <Badge colorScheme={getAlertColor(selectedAlert.level)} size="lg">
                          {selectedAlert.level}
                        </Badge>
                      </HStack>

                      <Text color="gray.600">{selectedAlert.message}</Text>

                      <SimpleGrid columns={2} spacing={4} fontSize="sm">
                        <VStack align="start" spacing={1}>
                          <Text color="gray.500">SKU:</Text>
                          <Text fontWeight="medium">{selectedAlert.productSku}</Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text color="gray.500">ประเภท:</Text>
                          <Text fontWeight="medium">{selectedAlert.type}</Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text color="gray.500">สต็อกปัจจุบัน:</Text>
                          <Text fontWeight="bold" color="red.600">
                            {selectedAlert.currentStock}
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text color="gray.500">สต็อกขั้นต่ำ:</Text>
                          <Text fontWeight="medium">{selectedAlert.minStockLevel}</Text>
                        </VStack>
                      </SimpleGrid>

                      <Progress
                        value={Math.max((selectedAlert.currentStock / selectedAlert.maxStockLevel) * 100, 0)}
                        colorScheme={getAlertColor(selectedAlert.level)}
                        size="md"
                        borderRadius="full"
                      />

                      <VStack align="stretch" spacing={2} fontSize="sm">
                        <HStack justify="space-between">
                          <Text color="gray.500">สร้างเมื่อ:</Text>
                          <Text>{formatDate(selectedAlert.createdAt)}</Text>
                        </HStack>
                        {selectedAlert.acknowledged && (
                          <>
                            <HStack justify="space-between">
                              <Text color="gray.500">อ่านโดย:</Text>
                              <Text>{selectedAlert.acknowledgedBy}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.500">อ่านเมื่อ:</Text>
                              <Text>
                                {selectedAlert.acknowledgedAt && formatDate(selectedAlert.acknowledgedAt)}
                              </Text>
                            </HStack>
                          </>
                        )}
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              ปิด
            </Button>
            {selectedAlert && !selectedAlert.acknowledged && onAcknowledge && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  handleAcknowledge(selectedAlert.id);
                  onDetailsClose();
                }}
              >
                ทำเครื่องหมายว่าอ่านแล้ว
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
};