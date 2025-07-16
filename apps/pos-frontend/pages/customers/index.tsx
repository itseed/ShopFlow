import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
} from "@chakra-ui/react";
import { FiUserPlus, FiDownload } from "react-icons/fi";
import { POSLayout } from "../../components";

const mockCustomers = [
  {
    id: "CUST-001",
    name: "นายสมชาย ใจดี",
    email: "somchai@example.com",
    phone: "081-234-5678",
    address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    totalOrders: 5,
    totalSpent: 2750,
    status: "active",
  },
  {
    id: "CUST-002",
    name: "นางสาวสมหญิง รักดี",
    email: "somying@example.com",
    phone: "082-345-6789",
    address: "456 ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330",
    totalOrders: 3,
    totalSpent: 1890,
    status: "vip",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "green";
    case "vip":
      return "purple";
    default:
      return "gray";
  }
};

const CustomersPage = () => {
  const [customers] = useState(mockCustomers);
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <POSLayout title="ลูกค้า">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">ลูกค้า</Heading>
          <HStack>
            <Button leftIcon={<Icon as={FiDownload} />} variant="outline">
              ส่งออก
            </Button>
            <Button colorScheme="blue" leftIcon={<Icon as={FiUserPlus} />}>
              เพิ่มลูกค้า
            </Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack>
                <Text>ลูกค้าทั้งหมด</Text>
                <Heading size="md">{totalCustomers}</Heading>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack>
                <Text>ยอดซื้อรวม</Text>
                <Heading size="md">฿{totalRevenue.toLocaleString()}</Heading>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ลูกค้า</Th>
                  <Th>ติดต่อ</Th>
                  <Th isNumeric>คำสั่งซื้อ</Th>
                  <Th isNumeric>ยอดซื้อ</Th>
                  <Th>สถานะ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {customers.map((c) => (
                  <Tr key={c.id}>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={c.name} />
                        <Text>{c.name}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0} fontSize="sm">
                        <Text>{c.email}</Text>
                        <Text>{c.phone}</Text>
                      </VStack>
                    </Td>
                    <Td isNumeric>{c.totalOrders}</Td>
                    <Td isNumeric>฿{c.totalSpent.toLocaleString()}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(c.status)}>{c.status}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </POSLayout>
  );
};

export default CustomersPage;
