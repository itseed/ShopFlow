import { ReactElement } from "react";
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Button,
  Icon,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";
import {
  FiShoppingCart,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
} from "react-icons/fi";
import Layout from "../components/Layout";
import { withAuth } from "../lib/auth";

// Mock data for orders
const mockOrders = [
  {
    id: "ORD-001",
    customerName: "นายสมชาย ใจดี",
    customerPhone: "081-234-5678",
    items: 3,
    total: 1250,
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "ORD-002",
    customerName: "นางสาวสมหญิง รักดี",
    customerPhone: "082-345-6789",
    items: 2,
    total: 899,
    status: "completed",
    createdAt: "2024-01-15T09:15:00Z",
  },
  {
    id: "ORD-003",
    customerName: "นายสมศักดิ์ มั่นคง",
    customerPhone: "083-456-7890",
    items: 5,
    total: 2100,
    status: "processing",
    createdAt: "2024-01-15T08:45:00Z",
  },
  {
    id: "ORD-004",
    customerName: "นางสาวสมใจ ยิ้มแย้ม",
    customerPhone: "084-567-8901",
    items: 1,
    total: 450,
    status: "cancelled",
    createdAt: "2024-01-14T16:20:00Z",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "processing":
      return "blue";
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "รอดำเนินการ";
    case "processing":
      return "กำลังจัดเตรียม";
    case "completed":
      return "เสร็จสิ้น";
    case "cancelled":
      return "ยกเลิก";
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return FiClock;
    case "processing":
      return FiPackage;
    case "completed":
      return FiCheckCircle;
    case "cancelled":
      return FiXCircle;
    default:
      return FiShoppingCart;
  }
};

function OrdersPage() {
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(
    (order) => order.status === "pending"
  ).length;
  const completedOrders = mockOrders.filter(
    (order) => order.status === "completed"
  ).length;
  const totalRevenue = mockOrders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg" fontFamily="heading" color="gray.900">
            คำสั่งซื้อ
          </Heading>
          <Text color="gray.600" fontFamily="body">
            จัดการคำสั่งซื้อทั้งหมด
          </Text>
        </Box>
        <Button colorScheme="blue" leftIcon={<Icon as={FiDownload} />}>
          ส่งออกข้อมูล
        </Button>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">คำสั่งซื้อทั้งหมด</StatLabel>
              <StatNumber fontFamily="heading">{totalOrders}</StatNumber>
              <StatHelpText fontFamily="body">รายการ</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">รอดำเนินการ</StatLabel>
              <StatNumber fontFamily="heading" color="yellow.500">
                {pendingOrders}
              </StatNumber>
              <StatHelpText fontFamily="body">รายการ</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">เสร็จสิ้นแล้ว</StatLabel>
              <StatNumber fontFamily="heading" color="green.500">
                {completedOrders}
              </StatNumber>
              <StatHelpText fontFamily="body">รายการ</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">ยอดขายรวม</StatLabel>
              <StatNumber fontFamily="heading" color="blue.500">
                ฿{totalRevenue.toLocaleString()}
              </StatNumber>
              <StatHelpText fontFamily="body">บาท</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Card>
        <CardBody>
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input placeholder="ค้นหาคำสั่งซื้อ..." fontFamily="body" />
            </InputGroup>

            <Select placeholder="สถานะทั้งหมด" maxW="200px" fontFamily="body">
              <option value="pending">รอดำเนินการ</option>
              <option value="processing">กำลังจัดเตรียม</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิก</option>
            </Select>

            <Button leftIcon={<Icon as={FiFilter} />} variant="outline">
              กรองข้อมูล
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th fontFamily="body">รหัสคำสั่งซื้อ</Th>
                <Th fontFamily="body">ลูกค้า</Th>
                <Th fontFamily="body">จำนวนสินค้า</Th>
                <Th fontFamily="body">ยอดรวม</Th>
                <Th fontFamily="body">สถานะ</Th>
                <Th fontFamily="body">วันที่สั่งซื้อ</Th>
                <Th fontFamily="body">จัดการ</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <Tr key={order.id}>
                    <Td fontFamily="body" fontWeight="semibold">
                      {order.id}
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontFamily="body" fontWeight="medium">
                          {order.customerName}
                        </Text>
                        <Text fontSize="sm" color="gray.500" fontFamily="body">
                          {order.customerPhone}
                        </Text>
                      </VStack>
                    </Td>
                    <Td fontFamily="body">{order.items} รายการ</Td>
                    <Td fontFamily="body" fontWeight="semibold">
                      ฿{order.total.toLocaleString()}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(order.status)}
                        borderRadius="full"
                        px={3}
                        py={1}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        w="fit-content"
                      >
                        <Icon as={StatusIcon} boxSize={3} />
                        <Text fontSize="xs" fontFamily="body">
                          {getStatusText(order.status)}
                        </Text>
                      </Badge>
                    </Td>
                    <Td fontFamily="body">
                      {new Date(order.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Icon as={FiEye} />}
                        >
                          ดู
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </VStack>
  );
}

// Use layout
OrdersPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="คำสั่งซื้อ">{page}</Layout>;
};

export default withAuth(OrdersPage, "staff");
