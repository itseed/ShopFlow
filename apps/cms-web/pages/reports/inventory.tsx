import React, { useState } from "react";
import { ReactElement } from "react";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  HStack,
  VStack,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Flex,
  Icon,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  FiPackage,
  FiAlertTriangle,
  FiTrendingDown,
  FiTrendingUp,
  FiDownload,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiPlus,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

function InventoryReportPage() {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const inventoryData = [
    {
      name: "โค้ก 325ml",
      current: 45,
      reorder: 50,
      max: 200,
      value: 1125,
      status: "low",
    },
    {
      name: "น้ำเปล่า 600ml",
      current: 89,
      reorder: 30,
      max: 150,
      value: 890,
      status: "good",
    },
    {
      name: "ลายส์ธรรมดา",
      current: 12,
      reorder: 25,
      max: 100,
      value: 480,
      status: "critical",
    },
    {
      name: "มาม่า หมูสับ",
      current: 156,
      reorder: 80,
      max: 300,
      value: 1560,
      status: "good",
    },
    {
      name: "นมเย็น UHT",
      current: 67,
      reorder: 40,
      max: 120,
      value: 1340,
      status: "good",
    },
    {
      name: "ขนมปัง",
      current: 23,
      reorder: 30,
      max: 80,
      value: 460,
      status: "low",
    },
    {
      name: "กาแฟ 3in1",
      current: 8,
      reorder: 20,
      max: 100,
      value: 240,
      status: "critical",
    },
    {
      name: "ผงซักฟอก",
      current: 34,
      reorder: 25,
      max: 60,
      value: 680,
      status: "good",
    },
  ];

  const categoryData = [
    { name: "เครื่องดื่ม", value: 45, color: "#3182CE" },
    { name: "ขนม", value: 25, color: "#38A169" },
    { name: "อาหารแห้ง", value: 20, color: "#D69E2E" },
    { name: "ของใช้", value: 10, color: "#9F7AEA" },
  ];

  const stockMovement = [
    { date: "01/07", inbound: 250, outbound: 180, net: 70 },
    { date: "02/07", inbound: 180, outbound: 220, net: -40 },
    { date: "03/07", inbound: 320, outbound: 200, net: 120 },
    { date: "04/07", inbound: 150, outbound: 280, net: -130 },
    { date: "05/07", inbound: 280, outbound: 190, net: 90 },
    { date: "06/07", inbound: 200, outbound: 240, net: -40 },
    { date: "07/07", inbound: 350, outbound: 210, net: 140 },
  ];

  const lowStockItems = inventoryData.filter(
    (item) => item.status === "critical" || item.status === "low"
  );
  const totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0);
  const totalItems = inventoryData.reduce((sum, item) => sum + item.current, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "red";
      case "low":
        return "orange";
      case "good":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "critical":
        return "วิกฤต";
      case "low":
        return "ต่ำ";
      case "good":
        return "ปกติ";
      default:
        return "ไม่ทราบ";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="2xl" mb={2} fontFamily="heading">
            รายงานสต็อกสินค้า
          </Heading>
          <Text color="gray.600" fontSize="lg">
            ข้อมูลสินค้าคงคลังและการเคลื่อนไหว
          </Text>
        </Box>
        <HStack spacing={4}>
          <Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            size="md"
            width="200px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
          >
            <option value="all">ทุกสาขา</option>
            <option value="branch-001">สาขาสยามสแควร์</option>
            <option value="branch-002">สาขาเซ็นทรัลเวิลด์</option>
            <option value="branch-003">สาขาเอ็มควอเทียร์</option>
          </Select>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="md"
            width="180px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
          >
            <option value="all">ทุกหมวดหมู่</option>
            <option value="drinks">เครื่องดื่ม</option>
            <option value="snacks">ขนม</option>
            <option value="food">อาหารแห้ง</option>
            <option value="supplies">ของใช้</option>
          </Select>
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="gray"
            size="md"
            variant="outline"
          >
            รีเฟรช
          </Button>
          <Button leftIcon={<FiDownload />} colorScheme="blue" size="md">
            ส่งออก
          </Button>
        </HStack>
      </Flex>

      {/* Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Alert status="warning" borderRadius="xl" mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">แจ้งเตือนสต็อก</Text>
            <Text fontSize="sm">
              มีสินค้า {lowStockItems.length} รายการที่ต้องเติมสต็อก
            </Text>
          </Box>
        </Alert>
      )}

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                มูลค่าสต็อกรวม
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                ฿{totalValue.toLocaleString()}
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +5.2% จากเดือนก่อน
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                จำนวนสินค้า
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                {totalItems.toLocaleString()}
              </StatNumber>
              <StatHelpText color="blue.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +120 ชิ้น
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                รายการสินค้า
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                {inventoryData.length}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="sm" fontWeight="medium">
                ทั้งหมด
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                ต้องเติมสต็อก
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="red.600">
                {lowStockItems.length}
              </StatNumber>
              <StatHelpText color="red.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                รายการ
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={8}>
        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                การเคลื่อนไหวสต็อก
              </Heading>
              <Text fontSize="sm" color="gray.600">
                รับเข้า-จ่ายออกรายวัน
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockMovement}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="inbound" fill="#38A169" name="รับเข้า" />
                    <Bar dataKey="outbound" fill="#F56565" name="จ่ายออก" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                สัดส่วนตามหมวดหมู่
              </Heading>
              <Text fontSize="sm" color="gray.600">
                แยกตามประเภทสินค้า
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <VStack spacing={2} mt={4}>
                {categoryData.map((item, index) => (
                  <HStack key={index} justify="space-between" w="100%">
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg={item.color} borderRadius="full" />
                      <Text fontSize="sm">{item.name}</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="medium">
                      {item.value}%
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Stock Table */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.100" shadow="lg">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="md" fontFamily="heading">
                รายละเอียดสต็อกสินค้า
              </Heading>
              <Text fontSize="sm" color="gray.600">
                ข้อมูลสต็อกทั้งหมด
              </Text>
            </Box>
            <HStack spacing={4}>
              <InputGroup width="250px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="ค้นหาสินค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="white"
                  borderColor="gray.300"
                  borderRadius="xl"
                />
              </InputGroup>
              <Button leftIcon={<FiPlus />} colorScheme="blue" size="md">
                เพิ่มสต็อก
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>สินค้า</Th>
                <Th isNumeric>ปัจจุบัน</Th>
                <Th isNumeric>จุดสั่งซื้อ</Th>
                <Th isNumeric>สูงสุด</Th>
                <Th isNumeric>มูลค่า</Th>
                <Th>สถานะ</Th>
                <Th>การดำเนินการ</Th>
              </Tr>
            </Thead>
            <Tbody>
              {inventoryData.map((item, index) => (
                <Tr key={index}>
                  <Td fontWeight="medium">{item.name}</Td>
                  <Td isNumeric>{item.current}</Td>
                  <Td isNumeric>{item.reorder}</Td>
                  <Td isNumeric>{item.max}</Td>
                  <Td isNumeric>฿{item.value.toLocaleString()}</Td>
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(item.status)}
                      variant="subtle"
                    >
                      {getStatusLabel(item.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size="sm" colorScheme="blue" variant="outline">
                        เติมสต็อก
                      </Button>
                      <Button size="sm" colorScheme="gray" variant="outline">
                        ประวัติ
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  );
}

// Use dashboard layout
InventoryReportPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายงานสต็อกสินค้า">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(InventoryReportPage, "staff");
