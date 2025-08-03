import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  useToast,
  Spinner,
  Center,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import {
  IoArrowBackOutline,
  IoPersonOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoReceiptOutline,
  IoStatsChartOutline,
} from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import {
  Customer,
  CustomerStats,
  CustomerTransaction,
  CustomerActivity,
  CustomerFormData,
  MembershipType,
} from "@shopflow/types";
import CustomerDetail from "../../components/customers/CustomerDetail";
import CustomerForm from "../../components/customers/CustomerForm";
import { POSLayout, LoadingSpinner } from "../../components";
import { formatCurrency } from "../../lib/sales";
import { useCustomer, useCustomers } from "../../hooks/useCustomers";

// Mock data - in real app would come from API
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

const mockCustomer: Customer = {
  id: "1",
  customerNumber: "C001",
  name: "สมชาย ใจดี",
  email: "somchai@email.com",
  phone: "0812345678",
  address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
  dateOfBirth: new Date("1985-05-15"),
  gender: "male",
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
  notes: "ลูกค้า VIP ชอบสินค้าคุณภาพดี มักจะซื้อสินค้าแบรนด์ดัง",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2024-01-10"),
};

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
    {
      productId: "P003",
      productName: "รองเท้าสปอร์ต",
      purchaseCount: 2,
      totalAmount: 6000,
    },
  ],
  monthlySpending: [
    { month: "2024-01", amount: 3500, orders: 1 },
    { month: "2023-12", amount: 5000, orders: 2 },
    { month: "2023-11", amount: 2500, orders: 1 },
    { month: "2023-10", amount: 4000, orders: 2 },
    { month: "2023-09", amount: 3000, orders: 1 },
    { month: "2023-08", amount: 5500, orders: 3 },
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
  {
    id: "3",
    customerId: "1",
    type: "purchase",
    amount: 2500,
    description: "ซื้อรองเท้าสปอร์ต",
    pointsEarned: 50,
    createdAt: new Date("2023-12-28"),
  },
  {
    id: "4",
    customerId: "1",
    type: "refund",
    amount: -800,
    description: "คืนเงินสินค้าชิ้นหนึ่ง",
    createdAt: new Date("2023-12-15"),
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
  {
    id: "3",
    customerId: "1",
    type: "membership_update",
    title: "อัปเกรดสมาชิก",
    description: "อัปเกรดเป็นสมาชิก Gold",
    createdAt: new Date("2023-06-15"),
  },
  {
    id: "4",
    customerId: "1",
    type: "profile_update",
    title: "อัปเดตข้อมูล",
    description: "อัปเดตข้อมูลที่อยู่และเบอร์โทร",
    createdAt: new Date("2023-05-20"),
  },
];

const CustomerDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const toast = useToast();

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Use customer hooks
  const {
    customer,
    stats,
    transactions,
    activities,
    loading,
    error,
  } = useCustomer(id as string);

  const { updateCustomer, deleteCustomer } = useCustomers({ autoLoad: false });

  const handleEditCustomer = () => {
    if (customer) {
      setEditingCustomer(customer);
      onFormOpen();
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customer) return;

    if (window.confirm(`ต้องการลบลูกค้า ${customer.name} หรือไม่?`)) {
      try {
        await deleteCustomer(customer.id);
        
        toast({
          title: "ลบลูกค้าสำเร็จ",
          description: `ลบข้อมูลลูกค้า ${customer.name} แล้ว`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        router.push("/customers");
      } catch (error: any) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message || "ไม่สามารถลบลูกค้าได้",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleCustomerSave = async (customerData: CustomerFormData) => {
    if (!editingCustomer) return;

    try {
      await updateCustomer(editingCustomer.id, customerData);
      onFormClose();

      toast({
        title: "อัปเดตข้อมูลสำเร็จ",
        description: `ข้อมูลลูกค้า ${customerData.name} ได้รับการอัปเดตแล้ว`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตข้อมูลลูกค้าได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddTransaction = () => {
    toast({
      title: "ฟีเจอร์กำลังพัฒนา",
      description: "การเพิ่มธุรกรรมโดยตรงจะเปิดให้ใช้ในอนาคต",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <POSLayout title="รายละเอียดลูกค้า">
        <Center py={20}>
          <LoadingSpinner />
        </Center>
      </POSLayout>
    );
  }

  if (!customer) {
    return (
      <POSLayout title="รายละเอียดลูกค้า">
        <Center py={20}>
          <VStack spacing={4}>
            <Alert status="error" maxW="md">
              <AlertIcon />
              <Box>
                <AlertTitle>ไม่พบข้อมูลลูกค้า!</AlertTitle>
                <AlertDescription>
                  ไม่สามารถค้นหาลูกค้าที่ต้องการได้
                </AlertDescription>
              </Box>
            </Alert>
            <Button
              leftIcon={<IoArrowBackOutline />}
              onClick={() => router.push("/customers")}
            >
              กลับไปหน้ารายการลูกค้า
            </Button>
          </VStack>
        </Center>
      </POSLayout>
    );
  }

  return (
    <POSLayout title={`ลูกค้า: ${customer.name}`}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Breadcrumb */}
              <Breadcrumb
                spacing="8px"
                separator={<FaChevronRight color="gray.500" />}
              >
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => router.push("/")}>
                    หน้าแรก
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => router.push("/customers")}>
                    จัดการลูกค้า
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink>{customer.name}</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>

              {/* Header Actions */}
              <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg="blue.100"
                    color="blue.600"
                  >
                    <Icon as={IoPersonOutline} boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {customer.name}
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.500">
                        รหัสลูกค้า: {customer.customerNumber}
                      </Text>
                      {customer.membership && (
                        <Badge
                          colorScheme={customer.membership.membershipType.color}
                          variant="solid"
                        >
                          {customer.membership.membershipType.name}
                        </Badge>
                      )}
                      <Badge
                        colorScheme={customer.isActive ? "green" : "red"}
                        variant="outline"
                      >
                        {customer.isActive ? "ใช้งานอยู่" : "ไม่ใช้งาน"}
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>

                <HStack spacing={2}>
                  <Button
                    leftIcon={<IoArrowBackOutline />}
                    variant="ghost"
                    onClick={() => router.push("/customers")}
                  >
                    กลับ
                  </Button>
                  <Button
                    leftIcon={<IoReceiptOutline />}
                    variant="outline"
                    onClick={handleAddTransaction}
                  >
                    เพิ่มธุรกรรม
                  </Button>
                  <Button
                    leftIcon={<IoCreateOutline />}
                    colorScheme="blue"
                    onClick={handleEditCustomer}
                  >
                    แก้ไขข้อมูล
                  </Button>
                  <Button
                    leftIcon={<IoTrashOutline />}
                    colorScheme="red"
                    variant="outline"
                    onClick={handleDeleteCustomer}
                  >
                    ลบลูกค้า
                  </Button>
                </HStack>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Customer Detail Component */}
        <CustomerDetail
          customer={customer}
          stats={stats}
          transactions={transactions}
          activities={activities}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          onAddTransaction={handleAddTransaction}
          showActions={false} // Actions are handled in header
        />

        {/* Customer Form Modal */}
        <CustomerForm
          isOpen={isFormOpen}
          onClose={onFormClose}
          customer={editingCustomer}
          membershipTypes={mockMembershipTypes}
          onSave={handleCustomerSave}
          mode="edit"
        />
      </VStack>
    </POSLayout>
  );
};

export default CustomerDetailPage;