import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  useToast,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  useColorModeValue,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Divider,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import {
  IoSearch,
  IoFilter,
  IoEye,
  IoRefresh,
  IoEllipsisVertical,
  IoDocument,
  IoWarning,
  IoCheckmarkCircle,
  IoTime,
  IoArrowUndo,
} from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import {
  POSLayout,
  TouchButton,
  POSCard,
  LoadingSpinner,
} from "../../components";
import { SalesTransaction } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";
import { useRouter } from "next/router";

interface RefundTransaction {
  id: string;
  originalTransactionId: string;
  originalTransactionNumber: string;
  refundNumber: string;
  refundAmount: number;
  refundReason: string;
  refundNotes?: string;
  refundedItems: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }[];
  customer?: {
    name: string;
    phone?: string;
    email?: string;
  };
  processedBy: {
    id: string;
    name: string;
    username: string;
  };
  status: "pending" | "approved" | "completed" | "rejected";
  createdAt: Date;
  processedAt?: Date;
  approvedBy?: {
    id: string;
    name: string;
    username: string;
  };
}

interface RefundFilters {
  searchTerm: string;
  status: string;
  dateRange: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const ReturnsPage = () => {
  const [refunds, setRefunds] = useState<RefundTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RefundFilters>({
    searchTerm: "",
    status: "all",
    dateRange: "today",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedRefund, setSelectedRefund] =
    useState<RefundTransaction | null>(null);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [stats, setStats] = useState({
    totalRefunds: 0,
    totalRefundAmount: 0,
    pendingRefunds: 0,
    completedRefunds: 0,
  });

  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isApprovalOpen,
    onOpen: onApprovalOpen,
    onClose: onApprovalClose,
  } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    loadRefunds();
  }, [filters]);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockRefunds: RefundTransaction[] = [
        {
          id: "refund_001",
          originalTransactionId: "tx_001",
          originalTransactionNumber: "TXN-2024-001",
          refundNumber: "REF-2024-001",
          refundAmount: 90,
          refundReason: "damaged",
          refundNotes: "กาแฟร้อนเกินไป ลูกค้าไม่พอใจ",
          refundedItems: [
            {
              itemId: "item_001",
              itemName: "กาแฟอเมริกาโน่",
              quantity: 2,
              unitPrice: 45,
              totalAmount: 90,
            },
          ],
          customer: {
            name: "คุณสมชาย ใจดี",
            phone: "081-234-5678",
            email: "somchai@example.com",
          },
          processedBy: {
            id: "cashier_001",
            name: "พนักงานเก็บเงิน",
            username: "cashier01",
          },
          status: "pending",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        },
        {
          id: "refund_002",
          originalTransactionId: "tx_002",
          originalTransactionNumber: "TXN-2024-002",
          refundNumber: "REF-2024-002",
          refundAmount: 120,
          refundReason: "wrong_item",
          refundNotes: "ลูกค้าสั่งข้าวผัดหมู แต่ได้ข้าวผัดกุ้ง",
          refundedItems: [
            {
              itemId: "item_002",
              itemName: "ข้าวผัดกุ้ง",
              quantity: 1,
              unitPrice: 120,
              totalAmount: 120,
            },
          ],
          customer: {
            name: "คุณสมหญิง",
            phone: "081-876-5432",
          },
          processedBy: {
            id: "cashier_002",
            name: "พนักงานเก็บเงิน 2",
            username: "cashier02",
          },
          approvedBy: {
            id: "manager_001",
            name: "ผู้จัดการร้าน",
            username: "manager01",
          },
          status: "completed",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
      ];

      // Apply filters
      let filteredRefunds = [...mockRefunds];

      if (filters.searchTerm) {
        filteredRefunds = filteredRefunds.filter(
          (refund) =>
            refund.refundNumber
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase()) ||
            refund.originalTransactionNumber
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase()) ||
            refund.customer?.name
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase())
        );
      }

      if (filters.status !== "all") {
        filteredRefunds = filteredRefunds.filter(
          (refund) => refund.status === filters.status
        );
      }

      // Sort refunds
      filteredRefunds.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof RefundTransaction];
        const bValue = b[filters.sortBy as keyof RefundTransaction];

        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        if (filters.sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setRefunds(filteredRefunds);

      // Calculate stats
      const totalRefunds = filteredRefunds.length;
      const totalRefundAmount = filteredRefunds.reduce(
        (sum, refund) => sum + refund.refundAmount,
        0
      );
      const pendingRefunds = filteredRefunds.filter(
        (refund) => refund.status === "pending"
      ).length;
      const completedRefunds = filteredRefunds.filter(
        (refund) => refund.status === "completed"
      ).length;

      setStats({
        totalRefunds,
        totalRefundAmount,
        pendingRefunds,
        completedRefunds,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลการคืนเงินได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewRefund = (refund: RefundTransaction) => {
    setSelectedRefund(refund);
    onOpen();
  };

  const handleApproveRefund = (refund: RefundTransaction) => {
    setSelectedRefund(refund);
    onApprovalOpen();
  };

  const handleApprovalSubmit = async (action: "approve" | "reject") => {
    if (!selectedRefund) return;

    setProcessingRefund(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const updatedRefund: RefundTransaction = {
        ...selectedRefund,
        status: action === "approve" ? "completed" : "rejected",
        processedAt: new Date(),
        approvedBy: {
          id: "manager_001",
          name: "ผู้จัดการร้าน",
          username: "manager01",
        },
      };

      setRefunds((prev) =>
        prev.map((r) => (r.id === selectedRefund.id ? updatedRefund : r))
      );

      toast({
        title:
          action === "approve"
            ? "อนุมัติการคืนเงินสำเร็จ"
            : "ปฏิเสธการคืนเงินสำเร็จ",
        description: `${
          action === "approve" ? "อนุมัติ" : "ปฏิเสธ"
        }การคืนเงิน ${formatCurrency(
          selectedRefund.refundAmount
        )} เรียบร้อยแล้ว`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onApprovalClose();
      setApprovalNotes("");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingRefund(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "yellow";
      case "approved":
        return "blue";
      case "completed":
        return "green";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "รอการอนุมัติ";
      case "approved":
        return "อนุมัติแล้ว";
      case "completed":
        return "เสร็จสิ้น";
      case "rejected":
        return "ปฏิเสธ";
      default:
        return status;
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case "damaged":
        return "สินค้าเสียหาย";
      case "wrong_item":
        return "สินค้าไม่ตรงตามคำสั่ง";
      case "customer_change_mind":
        return "ลูกค้าเปลี่ยนใจ";
      case "quality_issue":
        return "คุณภาพไม่ตรงตามมาตรฐาน";
      case "other":
        return "อื่นๆ";
      default:
        return reason;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <POSLayout title="การคืนสินค้า">
      <VStack spacing={6} align="stretch">
        {/* Header with Stats */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Text fontSize="2xl" fontWeight="bold">
              การคืนสินค้า
            </Text>
            <TouchButton
              leftIcon={<IoRefresh />}
              onClick={loadRefunds}
              isLoading={loading}
              variant="secondary"
            >
              รีเฟรช
            </TouchButton>
          </HStack>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>การคืนทั้งหมด</StatLabel>
                  <StatNumber color="blue.500">{stats.totalRefunds}</StatNumber>
                  <StatHelpText>รายการ</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>ยอดคืนรวม</StatLabel>
                  <StatNumber color="red.500">
                    {formatCurrency(stats.totalRefundAmount)}
                  </StatNumber>
                  <StatHelpText>บาท</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>รอการอนุมัติ</StatLabel>
                  <StatNumber color="orange.500">
                    {stats.pendingRefunds}
                  </StatNumber>
                  <StatHelpText>รายการ</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>เสร็จสิ้นแล้ว</StatLabel>
                  <StatNumber color="green.500">
                    {stats.completedRefunds}
                  </StatNumber>
                  <StatHelpText>รายการ</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        {/* Filters */}
        <POSCard p={4}>
          <VStack spacing={4}>
            <HStack spacing={4} w="full">
              <InputGroup flex={2}>
                <InputLeftElement>
                  <IoSearch />
                </InputLeftElement>
                <Input
                  placeholder="ค้นหาด้วยเลขที่การคืน, เลขที่คำสั่ง, หรือชื่อลูกค้า"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                    }))
                  }
                />
              </InputGroup>

              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                w="200px"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="pending">รอการอนุมัติ</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="rejected">ปฏิเสธ</option>
              </Select>

              <Select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
                }
                w="200px"
              >
                <option value="today">วันนี้</option>
                <option value="yesterday">เมื่อวาน</option>
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
                <option value="all">ทั้งหมด</option>
              </Select>
            </HStack>

            <HStack spacing={4} w="full">
              <Select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
                }
                w="200px"
              >
                <option value="createdAt">วันที่สร้าง</option>
                <option value="refundNumber">เลขที่การคืน</option>
                <option value="refundAmount">ยอดคืน</option>
              </Select>

              <Select
                value={filters.sortOrder}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: e.target.value as "asc" | "desc",
                  }))
                }
                w="150px"
              >
                <option value="desc">ใหม่ไปเก่า</option>
                <option value="asc">เก่าไปใหม่</option>
              </Select>
            </HStack>
          </VStack>
        </POSCard>

        {/* Refunds Table */}
        <POSCard>
          {loading ? (
            <Box py={10}>
              <LoadingSpinner />
            </Box>
          ) : (
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>เลขที่การคืน</Th>
                    <Th>คำสั่งเดิม</Th>
                    <Th>วันที่/เวลา</Th>
                    <Th>ลูกค้า</Th>
                    <Th>เหตุผล</Th>
                    <Th>ยอดคืน</Th>
                    <Th>สถานะ</Th>
                    <Th>จัดการ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {refunds.map((refund) => (
                    <Tr key={refund.id} _hover={{ bg: hoverBg }}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{refund.refundNumber}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {refund.processedBy.name}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium">
                          {refund.originalTransactionNumber}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm">
                            {formatDate(refund.createdAt)}
                          </Text>
                          {refund.processedAt && (
                            <Text fontSize="xs" color="gray.500">
                              ประมวลผล: {formatDate(refund.processedAt)}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {refund.customer?.name || "ไม่ระบุ"}
                        </Text>
                        {refund.customer?.phone && (
                          <Text fontSize="xs" color="gray.500">
                            {refund.customer.phone}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {getReasonText(refund.refundReason)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium" color="red.600">
                          {formatCurrency(refund.refundAmount)}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(refund.status)}>
                          {getStatusText(refund.status)}
                        </Badge>
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
                              onClick={() => handleViewRefund(refund)}
                            >
                              ดูรายละเอียด
                            </MenuItem>
                            {refund.status === "pending" && (
                              <MenuItem
                                icon={<IoCheckmarkCircle />}
                                onClick={() => handleApproveRefund(refund)}
                              >
                                อนุมัติ/ปฏิเสธ
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {!loading && refunds.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">
                ไม่พบข้อมูลการคืนเงินที่ตรงกับเงื่อนไข
              </Text>
            </Box>
          )}
        </POSCard>
      </VStack>

      {/* Refund Details Modal */}
      {selectedRefund && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack justify="space-between">
                <Text>รายละเอียดการคืนเงิน</Text>
                <Badge colorScheme={getStatusColor(selectedRefund.status)}>
                  {getStatusText(selectedRefund.status)}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Refund Info */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    ข้อมูลการคืนเงิน
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">เลขที่การคืน:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {selectedRefund.refundNumber}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">คำสั่งเดิม:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {selectedRefund.originalTransactionNumber}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">วันที่/เวลา:</Text>
                      <Text fontSize="sm">
                        {formatDate(selectedRefund.createdAt)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">ประมวลผลโดย:</Text>
                      <Text fontSize="sm">
                        {selectedRefund.processedBy.name}
                      </Text>
                    </HStack>
                    {selectedRefund.approvedBy && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">อนุมัติโดย:</Text>
                        <Text fontSize="sm">
                          {selectedRefund.approvedBy.name}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                <Divider />

                {/* Customer Info */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    ข้อมูลลูกค้า
                  </Text>
                  {selectedRefund.customer ? (
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">ชื่อ:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedRefund.customer.name}
                        </Text>
                      </HStack>
                      {selectedRefund.customer.phone && (
                        <HStack justify="space-between">
                          <Text fontSize="sm">โทรศัพท์:</Text>
                          <Text fontSize="sm">
                            {selectedRefund.customer.phone}
                          </Text>
                        </HStack>
                      )}
                      {selectedRefund.customer.email && (
                        <HStack justify="space-between">
                          <Text fontSize="sm">อีเมล:</Text>
                          <Text fontSize="sm">
                            {selectedRefund.customer.email}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      ไม่มีข้อมูลลูกค้า
                    </Text>
                  )}
                </Box>

                <Divider />

                {/* Refund Reason */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    เหตุผลการคืนเงิน
                  </Text>
                  <Text fontSize="sm" mb={2}>
                    {getReasonText(selectedRefund.refundReason)}
                  </Text>
                  {selectedRefund.refundNotes && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        หมายเหตุ:
                      </Text>
                      <Text fontSize="sm">{selectedRefund.refundNotes}</Text>
                    </Box>
                  )}
                </Box>

                <Divider />

                {/* Refunded Items */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    รายการที่คืน
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {selectedRefund.refundedItems.map((item, index) => (
                      <HStack key={index} justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {item.itemName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatCurrency(item.unitPrice)} x {item.quantity}
                          </Text>
                        </VStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(item.totalAmount)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Total */}
                <Box>
                  <HStack justify="space-between">
                    <Text fontSize="md" fontWeight="bold">
                      ยอดคืนรวม:
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="red.600">
                      {formatCurrency(selectedRefund.refundAmount)}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>ปิด</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Approval Modal */}
      {selectedRefund && (
        <Modal isOpen={isApprovalOpen} onClose={onApprovalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <IoWarning color="orange" />
                <Text>อนุมัติการคืนเงิน</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>ยืนยันการดำเนินการ</AlertTitle>
                    <AlertDescription>
                      คุณกำลังจะอนุมัติหรือปฏิเสธการคืนเงิน{" "}
                      {selectedRefund.refundNumber}
                      จำนวน {formatCurrency(selectedRefund.refundAmount)}
                    </AlertDescription>
                  </Box>
                </Alert>

                <FormControl>
                  <FormLabel>หมายเหตุ (ถ้ามี)</FormLabel>
                  <Textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="หมายเหตุเพิ่มเติม..."
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onApprovalClose}>
                  ยกเลิก
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => handleApprovalSubmit("reject")}
                  isLoading={processingRefund}
                >
                  ปฏิเสธ
                </Button>
                <Button
                  colorScheme="green"
                  onClick={() => handleApprovalSubmit("approve")}
                  isLoading={processingRefund}
                >
                  อนุมัติ
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </POSLayout>
  );
};

export default ReturnsPage;
