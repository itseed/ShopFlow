import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  Select,
  FormControl,
  FormLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Divider,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  RadioGroup,
  Radio,
  Stack,
} from "@chakra-ui/react";
import {
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart,
  FiPieChart,
  FiCalendar,
  FiFileText,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import {
  useSalesReports,
  useProductReports,
  useInventoryReports,
  useBranchComparisonReports,
  useDashboardSummary,
  useExportReport,
  useAdvancedReportFilters,
  type ExportFormat,
  type EnhancedReportFilters,
} from "../../lib/hooks/useReportsSystem";
import { PermissionGuard } from "../auth/PermissionGuard";

// Chart component (placeholder - would integrate with recharts or similar)
const ChartPlaceholder = ({ title, type }: { title: string; type: string }) => (
  <Box
    h="300px"
    bg="gray.50"
    border="1px"
    borderColor="gray.200"
    borderRadius="md"
    display="flex"
    alignItems="center"
    justifyContent="center"
    flexDirection="column"
  >
    <Box mb={2}>
      {type === "line" ? <FiTrendingUp size={32} /> : <FiPieChart size={32} />}
    </Box>
    <Text color="gray.500" fontWeight="medium">
      {title}
    </Text>
    <Text fontSize="sm" color="gray.400">
      Chart visualization
    </Text>
  </Box>
);

export default function ReportsDashboard() {
  const { filters, updateFilter, resetFilters, applyPreset } =
    useAdvancedReportFilters();
  const [selectedReportType, setSelectedReportType] = useState<string>("sales");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");

  const {
    isOpen: isExportOpen,
    onOpen: onExportOpen,
    onClose: onExportClose,
  } = useDisclosure();
  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();

  // Data hooks
  const { data: dashboardSummary, isLoading: summaryLoading } =
    useDashboardSummary(filters);
  const { data: salesReports, isLoading: salesLoading } =
    useSalesReports(filters);
  const { data: productReports, isLoading: productsLoading } =
    useProductReports(filters);
  const { data: inventoryReports, isLoading: inventoryLoading } =
    useInventoryReports(filters);
  const { data: branchReports, isLoading: branchLoading } =
    useBranchComparisonReports(filters);

  // Export mutation
  const exportReport = useExportReport();

  // Handle export
  const handleExport = async () => {
    await exportReport.mutateAsync({
      reportType: selectedReportType,
      filters,
      format: exportFormat,
      fileName: `${selectedReportType}-report-${
        new Date().toISOString().split("T")[0]
      }`,
    });
    onExportClose();
  };

  // Get status color for trends
  const getTrendColor = (value: number) => {
    if (value > 0) return "green";
    if (value < 0) return "red";
    return "gray";
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (summaryLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <VStack>
          <Spinner size="lg" />
          <Text>กำลังโหลดรายงาน...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header with controls */}
      <Card mb={6}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="lg">รายงานและการวิเคราะห์</Heading>
            <HStack spacing={3}>
              <Button leftIcon={<FiRefreshCw />} variant="outline" size="sm">
                รีเฟรช
              </Button>
              <Button
                leftIcon={<FiFilter />}
                variant="outline"
                size="sm"
                onClick={onFilterOpen}
              >
                ตัวกรอง
              </Button>
              <PermissionGuard permission="reports.export">
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="blue"
                  size="sm"
                  onClick={onExportOpen}
                >
                  ส่งออก
                </Button>
              </PermissionGuard>
            </HStack>
          </HStack>
        </CardHeader>

        <CardBody>
          <HStack spacing={4}>
            <FormControl maxW="200px">
              <FormLabel size="sm">ช่วงเวลา</FormLabel>
              <Select
                size="sm"
                value={filters.preset || "thisMonth"}
                onChange={(e) => applyPreset(e.target.value as any)}
              >
                <option value="today">วันนี้</option>
                <option value="yesterday">เมื่อวาน</option>
                <option value="thisWeek">สัปดาห์นี้</option>
                <option value="lastWeek">สัปดาห์ที่แล้ว</option>
                <option value="thisMonth">เดือนนี้</option>
                <option value="lastMonth">เดือนที่แล้ว</option>
                <option value="thisYear">ปีนี้</option>
                <option value="custom">กำหนดเอง</option>
              </Select>
            </FormControl>

            {filters.preset === "custom" && (
              <>
                <FormControl maxW="150px">
                  <FormLabel size="sm">วันที่เริ่ม</FormLabel>
                  <Input
                    type="date"
                    size="sm"
                    value={filters.startDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      updateFilter(
                        "startDate",
                        e.target.value + "T00:00:00.000Z"
                      )
                    }
                  />
                </FormControl>
                <FormControl maxW="150px">
                  <FormLabel size="sm">วันที่สิ้นสุด</FormLabel>
                  <Input
                    type="date"
                    size="sm"
                    value={filters.endDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      updateFilter("endDate", e.target.value + "T23:59:59.999Z")
                    }
                  />
                </FormControl>
              </>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Dashboard Summary */}
      {dashboardSummary && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>ยอดขายรวม</StatLabel>
                <StatNumber>
                  {formatCurrency(dashboardSummary.totalRevenue)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={
                      dashboardSummary.revenueGrowth >= 0
                        ? "increase"
                        : "decrease"
                    }
                  />
                  {formatPercentage(dashboardSummary.revenueGrowth)}{" "}
                  เทียบกับช่วงก่อน
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>จำนวนออเดอร์</StatLabel>
                <StatNumber>
                  {dashboardSummary.totalOrders.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={
                      dashboardSummary.ordersGrowth >= 0
                        ? "increase"
                        : "decrease"
                    }
                  />
                  {formatPercentage(dashboardSummary.ordersGrowth)}{" "}
                  เทียบกับช่วงก่อน
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>สินค้าทั้งหมด</StatLabel>
                <StatNumber>
                  {dashboardSummary.totalProducts.toLocaleString()}
                </StatNumber>
                <StatHelpText>รายการสินค้าในระบบ</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>ลูกค้า</StatLabel>
                <StatNumber>
                  {dashboardSummary.totalCustomers.toLocaleString()}
                </StatNumber>
                <StatHelpText>ลูกค้าที่มีการซื้อ</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Charts Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader>
            <Heading size="md">แนวโน้มยอดขาย</Heading>
          </CardHeader>
          <CardBody>
            <ChartPlaceholder title="Sales Trend Chart" type="line" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">การชำระเงิน</Heading>
          </CardHeader>
          <CardBody>
            <ChartPlaceholder title="Payment Methods Chart" type="pie" />
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Detailed Reports Tabs */}
      <Card>
        <CardBody>
          <Tabs>
            <TabList>
              <Tab>รายงานยอดขาย</Tab>
              <Tab>รายงานสินค้า</Tab>
              <Tab>รายงานสต็อก</Tab>
              <Tab>เปรียบเทียบสาขา</Tab>
            </TabList>

            <TabPanels>
              {/* Sales Report Tab */}
              <TabPanel>
                {salesLoading ? (
                  <Flex justify="center" py={8}>
                    <Spinner />
                  </Flex>
                ) : salesReports && salesReports.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>วันที่</Th>
                        <Th isNumeric>ยอดขาย</Th>
                        <Th isNumeric>จำนวนออเดอร์</Th>
                        <Th isNumeric>ค่าเฉลี่ยต่อออเดอร์</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {salesReports.map((report, index) => (
                        <Tr key={index}>
                          <Td>
                            {new Date(report.date).toLocaleDateString("th-TH")}
                          </Td>
                          <Td isNumeric>{formatCurrency(report.totalSales)}</Td>
                          <Td isNumeric>{report.totalOrders}</Td>
                          <Td isNumeric>
                            {formatCurrency(report.averageOrderValue)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">
                      ไม่มีข้อมูลยอดขายในช่วงเวลาที่เลือก
                    </Text>
                  </Box>
                )}
              </TabPanel>

              {/* Product Report Tab */}
              <TabPanel>
                {productsLoading ? (
                  <Flex justify="center" py={8}>
                    <Spinner />
                  </Flex>
                ) : productReports && productReports.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>สินค้า</Th>
                        <Th>หมวดหมู่</Th>
                        <Th isNumeric>จำนวนขาย</Th>
                        <Th isNumeric>รายได้</Th>
                        <Th isNumeric>สต็อก</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {productReports.map((product, index) => (
                        <Tr key={index}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">
                                {product.productName}
                              </Text>
                              {product.sku && (
                                <Text fontSize="sm" color="gray.500">
                                  {product.sku}
                                </Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>{product.category || "ไม่ระบุ"}</Td>
                          <Td isNumeric>{product.quantitySold}</Td>
                          <Td isNumeric>{formatCurrency(product.revenue)}</Td>
                          <Td isNumeric>
                            <Badge
                              colorScheme={
                                product.stockLevel > 10
                                  ? "green"
                                  : product.stockLevel > 0
                                  ? "orange"
                                  : "red"
                              }
                            >
                              {product.stockLevel}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">
                      ไม่มีข้อมูลสินค้าในช่วงเวลาที่เลือก
                    </Text>
                  </Box>
                )}
              </TabPanel>

              {/* Inventory Report Tab */}
              <TabPanel>
                {inventoryLoading ? (
                  <Flex justify="center" py={8}>
                    <Spinner />
                  </Flex>
                ) : inventoryReports && inventoryReports.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>สินค้า</Th>
                        <Th>หมวดหมู่</Th>
                        <Th isNumeric>สต็อกปัจจุบัน</Th>
                        <Th isNumeric>สต็อกขั้นต่ำ</Th>
                        <Th>สถานะ</Th>
                        <Th isNumeric>มูลค่า</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {inventoryReports.map((item, index) => (
                        <Tr key={index}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">
                                {item.productName}
                              </Text>
                              {item.sku && (
                                <Text fontSize="sm" color="gray.500">
                                  {item.sku}
                                </Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>{item.category || "ไม่ระบุ"}</Td>
                          <Td isNumeric>{item.currentStock}</Td>
                          <Td isNumeric>{item.minStock}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                item.stockStatus === "in_stock"
                                  ? "green"
                                  : item.stockStatus === "low_stock"
                                  ? "orange"
                                  : "red"
                              }
                            >
                              {item.stockStatus === "in_stock"
                                ? "ปกติ"
                                : item.stockStatus === "low_stock"
                                ? "ต่ำ"
                                : "หมด"}
                            </Badge>
                          </Td>
                          <Td isNumeric>{formatCurrency(item.stockValue)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">ไม่มีข้อมูลสต็อก</Text>
                  </Box>
                )}
              </TabPanel>

              {/* Branch Comparison Tab */}
              <TabPanel>
                {branchLoading ? (
                  <Flex justify="center" py={8}>
                    <Spinner />
                  </Flex>
                ) : branchReports && branchReports.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>สาขา</Th>
                        <Th isNumeric>ยอดขาย</Th>
                        <Th isNumeric>จำนวนออเดอร์</Th>
                        <Th isNumeric>ค่าเฉลี่ยต่อออเดอร์</Th>
                        <Th isNumeric>จำนวนพนักงาน</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {branchReports.map((branch, index) => (
                        <Tr key={index}>
                          <Td fontWeight="medium">{branch.branchName}</Td>
                          <Td isNumeric>{formatCurrency(branch.totalSales)}</Td>
                          <Td isNumeric>{branch.totalOrders}</Td>
                          <Td isNumeric>
                            {formatCurrency(branch.averageOrderValue)}
                          </Td>
                          <Td isNumeric>{branch.staffCount}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">
                      ไม่มีข้อมูลสาขาในช่วงเวลาที่เลือก
                    </Text>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Export Modal */}
      <Modal isOpen={isExportOpen} onClose={onExportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ส่งออกรายงาน</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>ประเภทรายงาน</FormLabel>
                <Select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                >
                  <option value="sales">รายงานยอดขาย</option>
                  <option value="products">รายงานสินค้า</option>
                  <option value="inventory">รายงานสต็อก</option>
                  <option value="branches">เปรียบเทียบสาขา</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>รูปแบบไฟล์</FormLabel>
                <RadioGroup
                  value={exportFormat}
                  onChange={(value) => setExportFormat(value as ExportFormat)}
                >
                  <Stack direction="column">
                    <Radio value="csv">CSV (สำหรับ Excel)</Radio>
                    <Radio value="excel">Excel (.xls)</Radio>
                    <Radio value="json">JSON</Radio>
                    <Radio value="pdf">PDF</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExportClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleExport}
              isLoading={exportReport.isPending}
            >
              ส่งออก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Filter Modal */}
      <Modal isOpen={isFilterOpen} onClose={onFilterClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ตัวกรองขั้นสูง</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>สาขา</FormLabel>
                <Select
                  value={filters.branchId || ""}
                  onChange={(e) =>
                    updateFilter("branchId", e.target.value || undefined)
                  }
                >
                  <option value="">ทุกสาขา</option>
                  {/* สาขาจะต้องดึงมาจาก API */}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>หมวดหมู่สินค้า</FormLabel>
                <Select
                  value={filters.categoryId || ""}
                  onChange={(e) =>
                    updateFilter("categoryId", e.target.value || undefined)
                  }
                >
                  <option value="">ทุกหมวดหมู่</option>
                  {/* หมวดหมู่จะต้องดึงมาจาก API */}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>จัดกลุ่มตาม</FormLabel>
                <Select
                  value={filters.groupBy || "day"}
                  onChange={(e) =>
                    updateFilter("groupBy", e.target.value as any)
                  }
                >
                  <option value="day">รายวัน</option>
                  <option value="week">รายสัปดาห์</option>
                  <option value="month">รายเดือน</option>
                  <option value="quarter">รายไตรมาส</option>
                  <option value="year">รายปี</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={resetFilters}>
              รีเซ็ต
            </Button>
            <Button colorScheme="blue" onClick={onFilterClose}>
              ใช้ตัวกรอง
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
