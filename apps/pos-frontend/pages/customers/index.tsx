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
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";

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
    customerNumber: "C001",
    name: "สมชาย ใจดี",
    email: "somchai@email.com",
    phone: "0812345678",
    address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
    dateOfBirth: new Date("1985-05-15"),
    isActive: true,
    membership: {
      id: "1",
      customerId: "1",
      membershipType: mockMembershipTypes[0],
      membershipNumber: "M0001",
      points: 1250,
      totalSpent: 75000,
      discountPercentage: 10,
      joinedAt: new Date("2023-01-15"),
      status: "active",
      expiresAt: new Date("2024-12-31"),
    },
    notes: "ลูกค้า VIP ชอบสินค้าคุณภาพดี",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    customerNumber: "C002",
    name: "สมหญิง รักสวย",
    email: "somying@email.com",
    phone: "0812345679",
    isActive: true,
    membership: {
      id: "2",
      customerId: "2",
      membershipType: mockMembershipTypes[1],
      membershipNumber: "M0002",
      points: 800,
      totalSpent: 35000,
      discountPercentage: 5,
      joinedAt: new Date("2023-03-20"),
      status: "active",
      expiresAt: new Date("2024-12-31"),
    },
    createdAt: new Date("2023-03-20"),
    updatedAt: new Date("2024-01-08"),
  },
  {
    id: "3",
    customerNumber: "C003",
    name: "อนุชา ทำงานหนัก",
    email: "anucha@email.com",
    phone: "0812345680",
    isActive: true,
    createdAt: new Date("2023-06-10"),
    updatedAt: new Date("2024-01-05"),
  },
];

const mockStats: CustomerStats = {
  customerId: "1",
  totalOrders: 25,
  totalSpent: 75000,
  averageOrderValue: 3000,
  lastPurchaseDate: new Date("2024-01-10"),
  firstPurchaseDate: new Date("2023-01-20"),
  favoriteProducts: [
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
  ],
  monthlySpending: [
    {
      month: "2024-01",
      amount: 3500,
      orders: 1,
    },
    {
      month: "2023-12",
      amount: 5000,
      orders: 2,
    },
  ],
  pointsBalance: 1250,
  membershipStatus: {
    currentType: "Gold",
    nextType: "Platinum",
    progressToNext: 75,
  },
};

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

type ViewMode = "list" | "detail";

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isLoading, setIsLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const toast = useToast();

  // Calculate overview statistics
  const overviewStats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.isActive).length;
    const totalRevenue = customers.reduce(
      (sum, c) => sum + (c.membership?.totalSpent || 0),
      0
    );
    const averageSpending = totalRevenue / totalCustomers || 0;
    const membersCount = customers.filter((c) => c.membership).length;

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      averageSpending,
      membersCount,
    };
  }, [customers]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    onFormOpen();
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    onFormOpen();
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    if (selectedCustomer?.id === customerId) {
      setViewMode("list");
      setSelectedCustomer(null);
    }
  };

  const handleCustomerSave = async (customerData: CustomerFormData) => {
    try {
      if (editingCustomer) {
        // Update existing customer
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === editingCustomer.id
              ? {
                  ...c,
                  name: customerData.name,
                  phone: customerData.phone,
                  email: customerData.email,
                  address: customerData.address,
                  dateOfBirth: customerData.dateOfBirth,
                  gender: customerData.gender,
                  notes: customerData.notes,
                  updatedAt: new Date(),
                }
              : c
          )
        );
        toast({
          title: "อัปเดตข้อมูลลูกค้าสำเร็จ",
          description: `ข้อมูลลูกค้า ${customerData.name} ได้รับการอัปเดตแล้ว`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new customer
        const membershipType = customerData.membershipType
          ? mockMembershipTypes.find(
              (mt) => mt.id === customerData.membershipType
            )
          : undefined;

        const newCustomer: Customer = {
          id: Date.now().toString(),
          customerNumber: `C${String(customers.length + 1).padStart(3, "0")}`,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
          dateOfBirth: customerData.dateOfBirth,
          gender: customerData.gender,
          notes: customerData.notes,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (membershipType) {
          newCustomer.membership = {
            id: Date.now().toString(),
            customerId: newCustomer.id,
            membershipType: membershipType,
            membershipNumber: `M${String(customers.length + 1).padStart(
              4,
              "0"
            )}`,
            points: 0,
            totalSpent: 0,
            discountPercentage: membershipType.discountPercentage,
            joinedAt: new Date(),
            status: "active",
          };
        }

        setCustomers((prev) => [newCustomer, ...prev]);
        toast({
          title: "เพิ่มลูกค้าสำเร็จ",
          description: `เพิ่มลูกค้า ${customerData.name} แล้ว`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      onFormClose();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลลูกค้าได้",
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

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setViewMode("list");
  };

  const handleExportCustomers = () => {
    // Mock export functionality
    toast({
      title: "กำลังส่งออกข้อมูล",
      description: "ระบบกำลังเตรียมไฟล์ Excel สำหรับดาวน์โหลด",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
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
                      ? selectedCustomer.name
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
                    <BreadcrumbLink>{selectedCustomer.name}</BreadcrumbLink>
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
          {isLoading ? (
            <Center py={10}>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>กำลังโหลดข้อมูลลูกค้า...</Text>
              </VStack>
            </Center>
          ) : (
            <CardBody>
              {viewMode === "list" && (
                <CustomerList
                  customers={customers}
                  onCustomerSelect={handleCustomerSelect}
                  onCustomerEdit={handleEditCustomer}
                  onCustomerDelete={handleDeleteCustomer}
                  showActions={true}
                />
              )}

              {viewMode === "detail" && selectedCustomer && (
                <CustomerDetail
                  customer={selectedCustomer}
                  stats={mockStats}
                  transactions={mockTransactions}
                  activities={mockActivities}
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
            </CardBody>
          )}
        </Card>

        {/* Customer Form Modal */}
        <CustomerForm
          isOpen={isFormOpen}
          onClose={onFormClose}
          customer={editingCustomer}
          membershipTypes={mockMembershipTypes}
          onSave={handleCustomerSave}
          mode={editingCustomer ? "edit" : "create"}
        />
      </VStack>
    </POSLayout>
  );
};

export default CustomersPage;
