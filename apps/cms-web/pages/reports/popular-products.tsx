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
  Progress,
  Flex,
  Icon,
  Grid,
  GridItem,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Image,
  Avatar,
  AvatarGroup,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiShoppingCart,
  FiHeart,
  FiEye,
  FiDollarSign,
  FiUsers,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiStar,
  FiBarChart,
  FiPercent,
  FiClock,
  FiFilter,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

function PopularProductsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Mock data
  const stats = [
    {
      label: "ยอดขายรวม",
      value: "2,456,789",
      change: 15.7,
      changeType: "increase",
      icon: FiDollarSign,
      color: "blue",
    },
    {
      label: "จำนวนสินค้าที่ขาย",
      value: "1,234",
      change: 8.2,
      changeType: "increase",
      icon: FiPackage,
      color: "green",
    },
    {
      label: "ลูกค้าที่ซื้อ",
      value: "856",
      change: 12.4,
      changeType: "increase",
      icon: FiUsers,
      color: "purple",
    },
    {
      label: "อัตราการซื้อซ้ำ",
      value: "68.3%",
      change: 5.1,
      changeType: "increase",
      icon: FiPercent,
      color: "orange",
    },
  ];

  const topProducts = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      category: "สมาร์ทโฟน",
      image: "/api/placeholder/60/60",
      sales: 156,
      revenue: 248000,
      growth: 23.5,
      rating: 4.8,
      views: 2456,
      likes: 189,
      stock: 45,
      trend: "up",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      category: "สมาร์ทโฟน",
      image: "/api/placeholder/60/60",
      sales: 134,
      revenue: 201000,
      growth: 18.7,
      rating: 4.7,
      views: 2234,
      likes: 167,
      stock: 38,
      trend: "up",
    },
    {
      id: 3,
      name: 'MacBook Pro 14"',
      category: "คอมพิวเตอร์",
      image: "/api/placeholder/60/60",
      sales: 89,
      revenue: 178000,
      growth: 15.2,
      rating: 4.9,
      views: 1876,
      likes: 234,
      stock: 23,
      trend: "up",
    },
    {
      id: 4,
      name: "AirPods Pro",
      category: "อุปกรณ์เสียง",
      image: "/api/placeholder/60/60",
      sales: 234,
      revenue: 156000,
      growth: 12.8,
      rating: 4.6,
      views: 3456,
      likes: 298,
      stock: 67,
      trend: "up",
    },
    {
      id: 5,
      name: 'iPad Pro 11"',
      category: "แท็บเล็ต",
      image: "/api/placeholder/60/60",
      sales: 78,
      revenue: 134000,
      growth: -5.3,
      rating: 4.5,
      views: 1654,
      likes: 123,
      stock: 34,
      trend: "down",
    },
    {
      id: 6,
      name: "Apple Watch Series 9",
      category: "สมาร์ทวอทช์",
      image: "/api/placeholder/60/60",
      sales: 198,
      revenue: 118000,
      growth: 28.4,
      rating: 4.7,
      views: 2789,
      likes: 267,
      stock: 56,
      trend: "up",
    },
    {
      id: 7,
      name: "Sony WH-1000XM5",
      category: "หูฟัง",
      image: "/api/placeholder/60/60",
      sales: 145,
      revenue: 87000,
      growth: 19.6,
      rating: 4.8,
      views: 1987,
      likes: 178,
      stock: 42,
      trend: "up",
    },
    {
      id: 8,
      name: "Dell XPS 13",
      category: "คอมพิวเตอร์",
      image: "/api/placeholder/60/60",
      sales: 67,
      revenue: 134000,
      growth: 8.7,
      rating: 4.4,
      views: 1456,
      likes: 109,
      stock: 29,
      trend: "up",
    },
  ];

  const categoryData = [
    { name: "สมาร์ทโฟน", value: 35, color: "#3182CE" },
    { name: "คอมพิวเตอร์", value: 25, color: "#38A169" },
    { name: "อุปกรณ์เสียง", value: 20, color: "#D69E2E" },
    { name: "แท็บเล็ต", value: 12, color: "#9F7AEA" },
    { name: "สมาร์ทวอทช์", value: 8, color: "#F56565" },
  ];

  const trendsData = [
    { day: "จ", sales: 45 },
    { day: "อ", sales: 52 },
    { day: "พ", sales: 48 },
    { day: "พฤ", sales: 67 },
    { day: "ศ", sales: 89 },
    { day: "ส", sales: 123 },
    { day: "อา", sales: 156 },
  ];

  const viewsData = [
    { time: "00:00", views: 234 },
    { time: "04:00", views: 123 },
    { time: "08:00", views: 567 },
    { time: "12:00", views: 789 },
    { time: "16:00", views: 654 },
    { time: "20:00", views: 432 },
  ];

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? FiTrendingUp : FiTrendingDown;
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "green" : "red";
  };

  const getStockColor = (stock: number) => {
    if (stock > 50) return "green";
    if (stock > 20) return "yellow";
    return "red";
  };

  const filteredProducts = topProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || product.category === selectedCategory)
  );

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="2xl" mb={2} fontFamily="heading">
            ผลิตภัณฑ์ยอดนิยม
          </Heading>
          <Text color="gray.600" fontSize="lg">
            วิเคราะห์ผลิตภัณฑ์ที่ขายดีและแนวโน้มการขาย
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
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            size="md"
            width="150px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
          >
            <option value="7d">7 วันที่ผ่านมา</option>
            <option value="30d">30 วันที่ผ่านมา</option>
            <option value="90d">90 วันที่ผ่านมา</option>
          </Select>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="gray"
            size="md"
            variant="outline"
          >
            ส่งออก
          </Button>
          <Button leftIcon={<FiRefreshCw />} colorScheme="blue" size="md">
            รีเฟรช
          </Button>
        </HStack>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {stats.map((stat, index) => (
          <Card
            key={index}
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardBody p={6}>
              <Flex align="center" justify="space-between">
                <Box>
                  <Stat>
                    <StatLabel
                      color="gray.500"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      {stat.label}
                    </StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      fontWeight="bold"
                      color="gray.900"
                    >
                      {stat.value}
                    </StatNumber>
                    <StatHelpText fontSize="sm" fontWeight="medium">
                      <StatArrow
                        type={stat.changeType as "increase" | "decrease"}
                      />
                      {stat.change}%
                    </StatHelpText>
                  </Stat>
                </Box>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg={`${stat.color}.50`}
                  color={`${stat.color}.600`}
                >
                  <Icon as={stat.icon} boxSize={6} />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        ))}
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
                แนวโน้มการขายรายวัน
              </Heading>
              <Text fontSize="sm" color="gray.600">
                ยอดขายสินค้ายอดนิยมใน 7 วันที่ผ่านมา
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#3182CE"
                      fill="#3182CE"
                      fillOpacity={0.2}
                      name="ยอดขาย"
                    />
                  </AreaChart>
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
                หมวดหมู่ยอดนิยม
              </Heading>
              <Text fontSize="sm" color="gray.600">
                สัดส่วนยอดขายตามหมวดหมู่
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
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Product Analysis Tabs */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.100" shadow="lg">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="md" fontFamily="heading">
                วิเคราะห์ผลิตภัณฑ์
              </Heading>
              <Text fontSize="sm" color="gray.600">
                ข้อมูลรายละเอียดผลิตภัณฑ์ยอดนิยม
              </Text>
            </Box>
            <HStack spacing={4}>
              <InputGroup size="md" width="300px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
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
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                size="md"
                width="200px"
                bg="white"
                borderColor="gray.300"
                borderRadius="xl"
              >
                <option value="all">ทุกหมวดหมู่</option>
                <option value="สมาร์ทโฟน">สมาร์ทโฟน</option>
                <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                <option value="อุปกรณ์เสียง">อุปกรณ์เสียง</option>
                <option value="แท็บเล็ต">แท็บเล็ต</option>
                <option value="สมาร์ทวอทช์">สมาร์ทวอทช์</option>
              </Select>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <Tabs index={activeTab} onChange={setActiveTab} colorScheme="blue">
            <TabList>
              <Tab>ยอดขายสูงสุด</Tab>
              <Tab>เพิ่มขึ้นมากสุด</Tab>
              <Tab>ได้รับความนิยม</Tab>
              <Tab>สต็อกน้อย</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ลำดับ</Th>
                        <Th>ผลิตภัณฑ์</Th>
                        <Th>หมวดหมู่</Th>
                        <Th>ยอดขาย</Th>
                        <Th>รายได้</Th>
                        <Th>แนวโน้ม</Th>
                        <Th>คะแนน</Th>
                        <Th>สต็อก</Th>
                        <Th>การดู</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredProducts
                        .sort((a, b) => b.sales - a.sales)
                        .map((product, index) => (
                          <Tr key={product.id}>
                            <Td>
                              <Badge colorScheme="blue" variant="outline">
                                #{index + 1}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={3}>
                                <Avatar size="sm" src={product.image} />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold" noOfLines={1}>
                                    {product.name}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    รหัส: P
                                    {product.id.toString().padStart(3, "0")}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge colorScheme="purple" variant="subtle">
                                {product.category}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontWeight="bold">{product.sales}</Text>
                              <Text fontSize="sm" color="gray.600">
                                ชิ้น
                              </Text>
                            </Td>
                            <Td>
                              <Text fontWeight="bold">
                                ฿{product.revenue.toLocaleString()}
                              </Text>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Icon
                                  as={getTrendIcon(product.trend)}
                                  color={`${getTrendColor(product.trend)}.500`}
                                />
                                <Text
                                  color={`${getTrendColor(product.trend)}.500`}
                                  fontWeight="semibold"
                                >
                                  {Math.abs(product.growth)}%
                                </Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Icon as={FiStar} color="yellow.400" />
                                <Text>{product.rating}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getStockColor(product.stock)}
                                variant="subtle"
                              >
                                {product.stock}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <HStack spacing={1}>
                                  <Icon as={FiEye} color="blue.400" />
                                  <Text fontSize="sm">{product.views}</Text>
                                </HStack>
                                <HStack spacing={1}>
                                  <Icon as={FiHeart} color="red.400" />
                                  <Text fontSize="sm">{product.likes}</Text>
                                </HStack>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel px={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ลำดับ</Th>
                        <Th>ผลิตภัณฑ์</Th>
                        <Th>หมวดหมู่</Th>
                        <Th>การเติบโต</Th>
                        <Th>ยอดขาย</Th>
                        <Th>รายได้</Th>
                        <Th>สต็อก</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredProducts
                        .filter((p) => p.growth > 0)
                        .sort((a, b) => b.growth - a.growth)
                        .map((product, index) => (
                          <Tr key={product.id}>
                            <Td>
                              <Badge colorScheme="green" variant="outline">
                                #{index + 1}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={3}>
                                <Avatar size="sm" src={product.image} />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold" noOfLines={1}>
                                    {product.name}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {product.category}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge colorScheme="purple" variant="subtle">
                                {product.category}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Icon as={FiTrendingUp} color="green.500" />
                                <Text color="green.500" fontWeight="bold">
                                  +{product.growth}%
                                </Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Text fontWeight="bold">
                                {product.sales} ชิ้น
                              </Text>
                            </Td>
                            <Td>
                              <Text fontWeight="bold">
                                ฿{product.revenue.toLocaleString()}
                              </Text>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getStockColor(product.stock)}
                                variant="subtle"
                              >
                                {product.stock}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel px={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ลำดับ</Th>
                        <Th>ผลิตภัณฑ์</Th>
                        <Th>หมวดหมู่</Th>
                        <Th>การดู</Th>
                        <Th>ไลค์</Th>
                        <Th>คะแนน</Th>
                        <Th>ยอดขาย</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredProducts
                        .sort((a, b) => b.views - a.views)
                        .map((product, index) => (
                          <Tr key={product.id}>
                            <Td>
                              <Badge colorScheme="purple" variant="outline">
                                #{index + 1}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={3}>
                                <Avatar size="sm" src={product.image} />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold" noOfLines={1}>
                                    {product.name}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {product.category}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge colorScheme="purple" variant="subtle">
                                {product.category}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Icon as={FiEye} color="blue.400" />
                                <Text fontWeight="bold">{product.views}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Icon as={FiHeart} color="red.400" />
                                <Text fontWeight="bold">{product.likes}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Icon as={FiStar} color="yellow.400" />
                                <Text fontWeight="bold">{product.rating}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Text fontWeight="bold">
                                {product.sales} ชิ้น
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel px={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ลำดับ</Th>
                        <Th>ผลิตภัณฑ์</Th>
                        <Th>หมวดหมู่</Th>
                        <Th>สต็อกคงเหลือ</Th>
                        <Th>ยอดขาย</Th>
                        <Th>รายได้</Th>
                        <Th>สถานะ</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredProducts
                        .sort((a, b) => a.stock - b.stock)
                        .map((product, index) => (
                          <Tr key={product.id}>
                            <Td>
                              <Badge colorScheme="red" variant="outline">
                                #{index + 1}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={3}>
                                <Avatar size="sm" src={product.image} />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold" noOfLines={1}>
                                    {product.name}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {product.category}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge colorScheme="purple" variant="subtle">
                                {product.category}
                              </Badge>
                            </Td>
                            <Td>
                              <Text
                                fontWeight="bold"
                                color={
                                  product.stock < 30 ? "red.500" : "gray.900"
                                }
                              >
                                {product.stock} ชิ้น
                              </Text>
                            </Td>
                            <Td>
                              <Text fontWeight="bold">
                                {product.sales} ชิ้น
                              </Text>
                            </Td>
                            <Td>
                              <Text fontWeight="bold">
                                ฿{product.revenue.toLocaleString()}
                              </Text>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  product.stock < 30
                                    ? "red"
                                    : product.stock < 50
                                    ? "yellow"
                                    : "green"
                                }
                                variant="subtle"
                              >
                                {product.stock < 30
                                  ? "ต้องสั่งเพิ่ม"
                                  : product.stock < 50
                                  ? "ต่ำ"
                                  : "ปกติ"}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Box>
  );
}

// Use dashboard layout
PopularProductsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="ผลิตภัณฑ์ยอดนิยม">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(PopularProductsPage, "staff");
