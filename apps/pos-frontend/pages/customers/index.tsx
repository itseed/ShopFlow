import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Flex,
  useToast,
  Spinner,
  Center,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Grid,
  GridItem,
  useColorModeValue,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  IoPersonAddOutline,
  IoDownloadOutline,
  IoStatsChartOutline,
  IoArrowBackOutline,
  IoPersonOutline,
  IoCashOutline,
  IoStar,
  IoTrendingUpOutline,
} from "react-icons/io5";
import {
  Customer,
  CustomerStats,
  CustomerTransaction,
  CustomerActivity,
  CustomerFormData,
  MembershipType,
} from "@shopflow/types";
import CustomerList from "../../components/customers/CustomerList";
import CustomerForm from "../../components/customers/CustomerForm";
import CustomerDetail from "../../components/customers/CustomerDetail";
import CustomerSearch from "../../components/customers/CustomerSearch";
import CustomerAnalytics from "../../components/customers/CustomerAnalytics";
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";
import { useCustomers, useCustomer } from "../../hooks/useCustomers";
import { downloadCustomersCSV, defaultCustomerFilters } from "../../lib/customers";

// Mock data for development
// Mock membership types for development
const mockMembershipTypes: MembershipType[] = [
  {
    id: "1",
    name: "Gold",
    color: "yellow",
    benefits: ["ส่วนลด 10%", "แต้มสะสม x2"],
    minSpent: 50000,
    discountPercentage: 10,
    pointsMultiplier: 2,
    description: "สมาชิกระดับทอง",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Silver",
    color: "gray",
    benefits: ["ส่วนลด 5%", "แต้มสะสม x1.5"],
    minSpent: 25000,
    discountPercentage: 5,
    pointsMultiplier: 1.5,
    description: "สมาชิกระดับเงิน",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockCustomers: Customer[] = [
  {
    id: "1",
    customer_code: "C001",
    first_name: "สมชาย",
    last_name: "ใจดี",
    email: "somchai@email.com",
    phone: "0812345678",
    address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
    country: "Thailand",
    customer_type: "individual",
    status: "active",
    credit_limit: 0,
    current_balance: 0,
    total_orders: 0,
    total_spent: 75000,
    loyalty_points: 1250,
    notes: "ลูกค้า VIP ชอบสินค้าคุณภาพดี",
    created_at: "2023-01-15T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "2",
    customer_code: "C002",
    first_name: "สมหญิง",
    last_name: "รักสวย",
    email: "somying@email.com",
    phone: "0812345679",
    country: "Thailand",
    customer_type: "individual",
    status: "active",
    credit_limit: 0,
    current_balance: 0,
    total_orders: 0,
    total_spent: 35000,
    loyalty_points: 800,
    created_at: "2023-03-20T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "3",
    customer_code: "C003",
    first_name: "อนุชา",
    last_name: "ทำงานหนัก",
    email: "anucha@email.com",
    phone: "0812345680",
    country: "Thailand",
    customer_type: "individual",
    status: "active",
    credit_limit: 0,
    current_balance: 0,
    total_orders: 0,
    total_spent: 0,
    loyalty_points: 0,
    created_at: "2023-06-10T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z",
  },
];

const mockStats: CustomerStats = {
  total_orders: 25,
  total_spent: 75000,
  avg_order_value: 3000,
  last_order_date: "2024-01-10T00:00:00Z",
  loyalty_points: 1250,
  status: "active",
};

// Mock favorite products (not part of CustomerStats)
const mockFavoriteProducts = [
  {
    productId: "P001",
    productName: "เสื้อยืดคุณภาพดี",
    purchaseCount: 5,
    totalAmount: 2500,
  },
  {
    productId: "P002",
    productName: "กางเกงยีนส์",
    purchaseCount: 3,
    totalAmount: 4500,
  },
];

const mockTransactions: CustomerTransaction[] = [
  {
    id: "1",
    customerId: "1",
    type: "purchase",
    amount: 3500,
    description: "ซื้อเสื้อยืด 2 ตัว + กางเกงยีนส์ 1 ตัว",
    pointsEarned: 70,
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    customerId: "1",
    type: "points_redeem",
    amount: 500,
    description: "ใช้แต้มแลกส่วนลด",
    pointsRedeemed: 100,
    createdAt: new Date("2024-01-05"),
  },
];

const mockActivities: CustomerActivity[] = [
  {
    id: "1",
    customerId: "1",
    type: "purchase",
    title: "ซื้อสินค้า",
    description: "ซื้อเสื้อยืด 2 ตัว มูลค่า ฿3,500",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    customerId: "1",
    type: "points_activity",
    title: "ได้รับแต้ม",
    description: "ได้รับแต้ม 70 แต้มจากการซื้อสินค้า",
    createdAt: new Date("2024-01-10"),
  },
];

type ViewMode = "list" | "detail" | "analytics";

const CustomersPage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const toast = useToast();

  // Use customer hooks
  const {
    customers,
    filteredCustomers,
    paginatedResult,
    loading,
    error,
    filters,
    setFilters,
    stats: overviewStats,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers,
  } = useCustomers();

  const {
    customer: selectedCustomerDetails,
    stats: customerStats,
    transactions: customerTransactions,
    activities: customerActivities,
  } = useCustomer(selectedCustomer?.id);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    onFormOpen();
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    onFormOpen();
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await deleteCustomer(customerId);
      if (selectedCustomer?.id === customerId) {
        setViewMode("list");
        setSelectedCustomer(null);
      }
      toast({
        title: "ลบลูกค้าสำเร็จ",
        description: "ลบข้อมูลลูกค้าแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบลูกค้าได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Helper function to get customer name
  const getCustomerName = (data: CustomerFormData | Customer): string => {
    if ('company_name' in data && data.company_name) {
      return data.company_name;
    }
    if ('first_name' in data || 'last_name' in data) {
      return `${data.first_name || ""} ${data.last_name || ""}`.trim();
    }
    if ('customer_code' in data && data.customer_code) {
      return data.customer_code;
    }
    return "ลูกค้า";
  };

  const handleCustomerSave = async (customerData: CustomerFormData) => {
    try {
      const customerName = getCustomerName(customerData);
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData);
        toast({
          title: "อัปเดตข้อมูลลูกค้าสำเร็จ",
          description: `ข้อมูลลูกค้า ${customerName} ได้รับการอัปเดตแล้ว`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await createCustomer(customerData);
        toast({
          title: "เพิ่มลูกค้าสำเร็จ",
          description: `เพิ่มลูกค้า ${customerName} แล้ว`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      onFormClose();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลลูกค้าได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode("detail");
  };

  const handleTabChange = (index: number) => {
    if (index === 0) {
      // When switching to customer list, clear selection if in detail view
      if (viewMode === "detail") {
        setSelectedCustomer(null);
      }
      setViewMode("list");
    } else if (index === 1) {
      setViewMode("analytics");
      setSelectedCustomer(null); // Clear selection when viewing analytics
    }
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setViewMode("list");
  };

  const handleExportCustomers = () => {
    try {
      downloadCustomersCSV(customers, "customers-export.csv");
      toast({
        title: "ส่งออกข้อมูลสำเร็จ",
        description: "ไฟล์ CSV ได้ถูกดาวน์โหลดแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออกข้อมูลได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Style values for consistent design
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const pageBg = useColorModeValue("gray.50", "gray.900");

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
          <Flex
            justify="space-between"
            align="center"
            position="relative"
            zIndex={1}
          >
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                >
                  <Icon as={IoPersonOutline} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    {viewMode === "detail" ? "ข้อมูลลูกค้า" : "จัดการลูกค้า"}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {viewMode === "detail" && selectedCustomer
                      ? getCustomerName(selectedCustomer)
                      : `${overviewStats.totalCustomers} รายการ`}
                  </Text>
                </VStack>
              </HStack>

              {/* Breadcrumb */}
              <Breadcrumb color="whiteAlpha.800" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">หน้าแรก</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/customers">
                    จัดการลูกค้า
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {viewMode === "detail" && selectedCustomer && (
                  <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink>{getCustomerName(selectedCustomer)}</BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </Breadcrumb>
            </VStack>

            <HStack spacing={3}>
              {viewMode === "list" && (
                <>
                  <Button
                    leftIcon={<Icon as={IoDownloadOutline} />}
                    variant="solid"
                    colorScheme="whiteAlpha"
                    onClick={handleExportCustomers}
                  >
                    ส่งออกข้อมูล
                  </Button>
                  <Button
                    leftIcon={<Icon as={IoPersonAddOutline} />}
                    colorScheme="white"
                    variant="solid"
                    onClick={handleAddCustomer}
                  >
                    เพิ่มลูกค้า
                  </Button>
                </>
              )}
              {viewMode === "detail" && selectedCustomer && (
                <>
                  <Button
                    leftIcon={<Icon as={IoArrowBackOutline} />}
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    onClick={handleBackToList}
                  >
                    กลับ
                  </Button>
                  <Button
                    leftIcon={<Icon as={IoPersonAddOutline} />}
                    colorScheme="white"
                    variant="solid"
                    onClick={() => handleEditCustomer(selectedCustomer)}
                  >
                    แก้ไขข้อมูล
                  </Button>
                </>
              )}
            </HStack>
          </Flex>

          {/* Overview Statistics (only in list view) */}
          {viewMode === "list" && (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 4 }}
              spacing={6}
              mt={8}
              position="relative"
              zIndex={1}
            >
              <Stat>
                <StatLabel color="whiteAlpha.800">ลูกค้าทั้งหมด</StatLabel>
                <StatNumber fontSize="3xl">
                  {overviewStats.totalCustomers.toLocaleString()}
                </StatNumber>
                <StatHelpText color="whiteAlpha.800">
                  <HStack>
                    <Text>ใช้งาน:</Text>
                    <Badge colorScheme="green" variant="solid">
                      {overviewStats.activeCustomers}
                    </Badge>
                  </HStack>
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel color="whiteAlpha.800">ยอดขายรวม</StatLabel>
                <StatNumber fontSize="3xl">
                  {formatCurrency(overviewStats.totalRevenue)}
                </StatNumber>
                <StatHelpText color="whiteAlpha.800">
                  จากลูกค้าทั้งหมด
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel color="whiteAlpha.800">ยอดเฉลี่ยต่อคน</StatLabel>
                <StatNumber fontSize="3xl">
                  {formatCurrency(overviewStats.averageSpending)}
                </StatNumber>
                <StatHelpText color="whiteAlpha.800">
                  ค่าเฉลี่ยการซื้อ
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel color="whiteAlpha.800">สมาชิก</StatLabel>
                <StatNumber fontSize="3xl">
                  {overviewStats.membersCount.toLocaleString()}
                </StatNumber>
                <StatHelpText color="whiteAlpha.800">
                  {(
                    (overviewStats.membersCount /
                      overviewStats.totalCustomers) *
                    100
                  ).toFixed(1)}
                  % ของทั้งหมด
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          )}
        </Box>

        {/* Main Content */}
        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          {loading ? (
            <Center py={10}>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>กำลังโหลดข้อมูลลูกค้า...</Text>
              </VStack>
            </Center>
          ) : (
            <CardBody>
              <Tabs 
                variant="enclosed" 
                onChange={handleTabChange}
                index={viewMode === "analytics" ? 1 : 0}
              >
                <TabList>
                  <Tab>รายชื่อลูกค้า</Tab>
                  <Tab>รายงานและสถิติ</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel px={0}>
                    {viewMode === "list" && (
                      <VStack spacing={6} align="stretch">
                        <CustomerSearch
                          filters={filters}
                          onFiltersChange={setFilters}
                          onSearch={() => {/* Search is automatically applied */}}
                          onReset={() => setFilters(defaultCustomerFilters)}
                          isLoading={loading}
                          customerCount={filteredCustomers.length}
                          membershipTypes={mockMembershipTypes}
                        />
                        <CustomerList
                          customers={paginatedResult.customers}
                          onCustomerSelect={handleCustomerSelect}
                          onCustomerEdit={handleEditCustomer}
                          onCustomerDelete={handleDeleteCustomer}
                          showActions={true}
                        />
                      </VStack>
                    )}

                    {viewMode === "detail" && selectedCustomer && (
                      <CustomerDetail
                        customer={selectedCustomerDetails || selectedCustomer}
                        stats={customerStats}
                        transactions={customerTransactions}
                        activities={customerActivities}
                        onEdit={() => handleEditCustomer(selectedCustomer)}
                        onDelete={() => handleDeleteCustomer(selectedCustomer.id)}
                        onAddTransaction={() => {
                          toast({
                            title: "Feature Coming Soon",
                            description: "การเพิ่มธุรกรรมโดยตรงจะเปิดให้ใช้ในอนาคต",
                            status: "info",
                            duration: 3000,
                            isClosable: true,
                          });
                        }}
                        showActions={true}
                      />
                    )}
                  </TabPanel>
                  
                  <TabPanel px={0}>
                    <CustomerAnalytics
                      analytics={{
                        ...overviewStats,
                        monthlyGrowth: {
                          newCustomers: 12,
                          growthRate: 8.5,
                        },
                        topSpenders: customers
                          .filter(c => (c.total_spent || 0) > 0)
                          .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
                          .slice(0, 5)
                          .map(c => ({
                            customerId: c.id,
                            customerName: getCustomerName(c),
                            totalSpent: c.total_spent || 0,
                            ordersCount: Math.floor(Math.random() * 20) + 5, // Mock data
                          })),
                        genderStats: overviewStats.genderStats,
                        ageStats: overviewStats.ageStats,
                        membershipStats: overviewStats.membershipStats,
                      }}
                      isLoading={loading}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          )}
        </Card>

        {/* Customer Form Modal */}
        <CustomerForm
          isOpen={isFormOpen}
          onClose={onFormClose}
          customer={editingCustomer}
          onSave={handleCustomerSave}
          mode={editingCustomer ? "edit" : "create"}
        />
      </VStack>
    </POSLayout>
  );
};

export default CustomersPage;

// Disable static generation for pages that use React Query
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
