import React, { useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import { useRouter } from "next/router";
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
  Spinner,
  Alert,
  AlertIcon,
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
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Avatar,
  Divider,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiEdit2,
  FiShoppingCart,
  FiCalendar,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

// Mock customer data (replace with real API call)
const mockCustomer = {
  id: "1",
  name: "สมชาย ใจดี",
  email: "somchai@example.com",
  phone: "089-123-4567",
  address: "123 หมู่บ้านสุขสันต์ แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-20T15:30:00Z",
  total_orders: 15,
  total_spent: 45750,
  average_order: 3050,
  last_order_date: "2024-01-18T14:20:00Z",
  status: "active",
  notes: "ลูกค้าประจำ ชอบสินค้าคุณภาพดี",
};

// Mock orders data
const mockOrders = [
  {
    id: "ORD-001",
    order_number: "ORD-001",
    total: 3500,
    status: "completed",
    created_at: "2024-01-18T14:20:00Z",
    items_count: 3,
  },
  {
    id: "ORD-002",
    order_number: "ORD-002",
    total: 2800,
    status: "completed",
    created_at: "2024-01-15T09:15:00Z",
    items_count: 2,
  },
  {
    id: "ORD-003",
    order_number: "ORD-003",
    total: 5200,
    status: "processing",
    created_at: "2024-01-20T11:45:00Z",
    items_count: 4,
  },
];

const CustomerDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;

  const [customer] = useState(mockCustomer); // Replace with real API call
  const [orders] = useState(mockOrders); // Replace with real API call
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes,
  });

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const handleEditSave = () => {
    // Implement save logic here
    console.log("Saving customer:", editFormData);
    onEditClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "processing":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "สำเร็จ";
      case "processing":
        return "กำลังดำเนินการ";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  if (!customer) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>กำลังโหลดข้อมูลลูกค้า...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <HStack spacing={4}>
          <IconButton
            aria-label="กลับ"
            icon={<FiArrowLeft />}
            onClick={() => router.back()}
            variant="ghost"
          />
          <VStack align="start" spacing={0}>
            <Heading size="lg">ข้อมูลลูกค้า</Heading>
            <Text color="gray.500">รายละเอียดและประวัติการซื้อ</Text>
          </VStack>
        </HStack>
        <Button leftIcon={<FiEdit2 />} colorScheme="blue" onClick={onEditOpen}>
          แก้ไขข้อมูล
        </Button>
      </HStack>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <HStack spacing={4}>
            <Avatar size="lg" name={customer.name} bg="blue.500" />
            <VStack align="start" spacing={1}>
              <Heading size="md">{customer.name}</Heading>
              <HStack spacing={4}>
                <HStack spacing={1}>
                  <FiMail />
                  <Text fontSize="sm" color="gray.600">
                    {customer.email}
                  </Text>
                </HStack>
                <HStack spacing={1}>
                  <FiPhone />
                  <Text fontSize="sm" color="gray.600">
                    {customer.phone}
                  </Text>
                </HStack>
              </HStack>
              <Badge colorScheme="green">ลูกค้าปกติ</Badge>
            </VStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Stat>
              <StatLabel>จำนวนออเดอร์ทั้งหมด</StatLabel>
              <StatNumber>{customer.total_orders}</StatNumber>
              <StatHelpText>ครั้ง</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>ยอดซื้อทั้งหมด</StatLabel>
              <StatNumber>฿{customer.total_spent.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +12%
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>ยอดซื้อเฉลี่ย</StatLabel>
              <StatNumber>
                ฿{customer.average_order.toLocaleString()}
              </StatNumber>
              <StatHelpText>ต่อออเดอร์</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>ซื้อล่าสุด</StatLabel>
              <StatNumber fontSize="md">
                {formatDistanceToNow(new Date(customer.last_order_date), {
                  addSuffix: true,
                  locale: th,
                })}
              </StatNumber>
              <StatHelpText>
                {new Date(customer.last_order_date).toLocaleDateString("th-TH")}
              </StatHelpText>
            </Stat>
          </SimpleGrid>

          <Divider my={6} />

          <VStack align="start" spacing={3}>
            <HStack spacing={1}>
              <FiMapPin />
              <Text fontWeight="semibold">ที่อยู่:</Text>
            </HStack>
            <Text color="gray.600" pl={6}>
              {customer.address}
            </Text>

            {customer.notes && (
              <>
                <Text fontWeight="semibold" mt={4}>
                  หมายเหตุ:
                </Text>
                <Text color="gray.600" pl={6}>
                  {customer.notes}
                </Text>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Orders History */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">ประวัติการสั่งซื้อ</Heading>
            <Badge variant="outline">{orders.length} รายการ</Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>เลขที่ออเดอร์</Th>
                <Th>วันที่สั่ง</Th>
                <Th>จำนวนสินค้า</Th>
                <Th>ยอดรวม</Th>
                <Th>สถานะ</Th>
                <Th>การดำเนินการ</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.id}>
                  <Td>
                    <Text fontWeight="semibold">{order.order_number}</Text>
                  </Td>
                  <Td>
                    <Text>
                      {new Date(order.created_at).toLocaleDateString("th-TH")}
                    </Text>
                  </Td>
                  <Td>
                    <Text>{order.items_count} รายการ</Text>
                  </Td>
                  <Td>
                    <Text fontWeight="semibold">
                      ฿{order.total.toLocaleString()}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<FiShoppingCart />}
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      ดูรายละเอียด
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Edit Customer Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>แก้ไขข้อมูลลูกค้า</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>ชื่อ</FormLabel>
                <Input
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      name: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>อีเมล</FormLabel>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      email: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>เบอร์โทรศัพท์</FormLabel>
                <Input
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      phone: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>ที่อยู่</FormLabel>
                <Input
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      address: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>หมายเหตุ</FormLabel>
                <Input
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      notes: e.target.value,
                    })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

const CustomerDetail: NextPageWithLayout = () => {
  return <CustomerDetailPage />;
};

CustomerDetail.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายละเอียดลูกค้า">{page}</Layout>;
};

export default withAuth(CustomerDetail);
