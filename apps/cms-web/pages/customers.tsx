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
  Avatar,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUserPlus,
} from "react-icons/fi";
import Layout from "../components/Layout";
import { withAuth } from "../lib/auth";

// Mock data for customers
const mockCustomers = [
  {
    id: "CUST-001",
    name: "นายสมชาย ใจดี",
    email: "somchai@example.com",
    phone: "081-234-5678",
    address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    totalOrders: 5,
    totalSpent: 2750,
    lastOrderDate: "2024-01-15T10:30:00Z",
    status: "active",
    joinedDate: "2023-08-15T00:00:00Z",
  },
  {
    id: "CUST-002",
    name: "นางสาวสมหญิง รักดี",
    email: "somying@example.com",
    phone: "082-345-6789",
    address: "456 ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330",
    totalOrders: 3,
    totalSpent: 1890,
    lastOrderDate: "2024-01-14T16:20:00Z",
    status: "active",
    joinedDate: "2023-09-22T00:00:00Z",
  },
  {
    id: "CUST-003",
    name: "นายสมศักดิ์ มั่นคง",
    email: "somsak@example.com",
    phone: "083-456-7890",
    address: "789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
    totalOrders: 8,
    totalSpent: 4200,
    lastOrderDate: "2024-01-13T14:15:00Z",
    status: "vip",
    joinedDate: "2023-06-10T00:00:00Z",
  },
  {
    id: "CUST-004",
    name: "นางสาวสมใจ ยิ้มแย้ม",
    email: "somjai@example.com",
    phone: "084-567-8901",
    address: "321 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400",
    totalOrders: 1,
    totalSpent: 450,
    lastOrderDate: "2024-01-10T11:30:00Z",
    status: "inactive",
    joinedDate: "2024-01-01T00:00:00Z",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "green";
    case "vip":
      return "purple";
    case "inactive":
      return "gray";
    default:
      return "gray";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "ใช้งานอยู่";
    case "vip":
      return "ลูกค้า VIP";
    case "inactive":
      return "ไม่ใช้งาน";
    default:
      return status;
  }
};

function CustomersPage() {
  const totalCustomers = mockCustomers.length;
  const activeCustomers = mockCustomers.filter(
    (customer) => customer.status === "active"
  ).length;
  const vipCustomers = mockCustomers.filter(
    (customer) => customer.status === "vip"
  ).length;
  const totalRevenue = mockCustomers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg" fontFamily="heading" color="gray.900">
            ลูกค้า
          </Heading>
          <Text color="gray.600" fontFamily="body">
            จัดการข้อมูลลูกค้าทั้งหมด
          </Text>
        </Box>
        <HStack>
          <Button leftIcon={<Icon as={FiDownload} />} variant="outline">
            ส่งออกข้อมูล
          </Button>
          <Button colorScheme="blue" leftIcon={<Icon as={FiUserPlus} />}>
            เพิ่มลูกค้าใหม่
          </Button>
        </HStack>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">ลูกค้าทั้งหมด</StatLabel>
              <StatNumber fontFamily="heading">{totalCustomers}</StatNumber>
              <StatHelpText fontFamily="body">คน</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">ใช้งานอยู่</StatLabel>
              <StatNumber fontFamily="heading" color="green.500">
                {activeCustomers}
              </StatNumber>
              <StatHelpText fontFamily="body">คน</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">ลูกค้า VIP</StatLabel>
              <StatNumber fontFamily="heading" color="purple.500">
                {vipCustomers}
              </StatNumber>
              <StatHelpText fontFamily="body">คน</StatHelpText>
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
              <Input placeholder="ค้นหาลูกค้า..." fontFamily="body" />
            </InputGroup>

            <Select placeholder="สถานะทั้งหมด" maxW="200px" fontFamily="body">
              <option value="active">ใช้งานอยู่</option>
              <option value="vip">ลูกค้า VIP</option>
              <option value="inactive">ไม่ใช้งาน</option>
            </Select>

            <Button leftIcon={<Icon as={FiFilter} />} variant="outline">
              กรองข้อมูล
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th fontFamily="body">ลูกค้า</Th>
                <Th fontFamily="body">ข้อมูลติดต่อ</Th>
                <Th fontFamily="body">ที่อยู่</Th>
                <Th fontFamily="body">คำสั่งซื้อ</Th>
                <Th fontFamily="body">ยอดซื้อรวม</Th>
                <Th fontFamily="body">สถานะ</Th>
                <Th fontFamily="body">จัดการ</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockCustomers.map((customer) => (
                <Tr key={customer.id}>
                  <Td>
                    <HStack>
                      <Avatar
                        size="sm"
                        name={customer.name}
                        bg="blue.500"
                        color="white"
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontFamily="body" fontWeight="medium">
                          {customer.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500" fontFamily="body">
                          {customer.id}
                        </Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FiMail} boxSize={3} color="gray.400" />
                        <Text fontSize="sm" fontFamily="body">
                          {customer.email}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiPhone} boxSize={3} color="gray.400" />
                        <Text fontSize="sm" fontFamily="body">
                          {customer.phone}
                        </Text>
                      </HStack>
                    </VStack>
                  </Td>
                  <Td maxW="200px">
                    <HStack align="start">
                      <Icon as={FiMapPin} boxSize={3} color="gray.400" mt={1} />
                      <Text fontSize="sm" fontFamily="body" noOfLines={2}>
                        {customer.address}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontFamily="body" fontWeight="semibold">
                        {customer.totalOrders} รายการ
                      </Text>
                      <Text fontSize="sm" color="gray.500" fontFamily="body">
                        ล่าสุด:{" "}
                        {new Date(customer.lastOrderDate).toLocaleDateString(
                          "th-TH",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </Text>
                    </VStack>
                  </Td>
                  <Td fontFamily="body" fontWeight="semibold">
                    ฿{customer.totalSpent.toLocaleString()}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(customer.status)}
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      <Text fontSize="xs" fontFamily="body">
                        {getStatusText(customer.status)}
                      </Text>
                    </Badge>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Icon as={FiEdit} />}
                      >
                        แก้ไข
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </VStack>
  );
}

// Use layout
CustomersPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="ลูกค้า">{page}</Layout>;
};

export default withAuth(CustomersPage, "staff");
