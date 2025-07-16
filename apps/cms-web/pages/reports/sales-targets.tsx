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
  CircularProgress,
  CircularProgressLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import {
  FiTarget,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiEdit,
  FiPlus,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

function SalesTargetsPage() {
  const [timeRange, setTimeRange] = useState("current");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Mock data
  const targets = [
    {
      id: 1,
      name: "เป้าหมายรายเดือน - กรกฎาคม 2024",
      period: "2024-07",
      target: 400000,
      current: 328500,
      percentage: 82.1,
      daysLeft: 16,
      status: "on-track",
      branches: [
        {
          name: "สยามสแควร์",
          target: 85000,
          current: 89500,
          percentage: 105.3,
        },
        {
          name: "เซ็นทรัลเวิลด์",
          target: 80000,
          current: 76200,
          percentage: 95.3,
        },
        {
          name: "เอ็มควอเทียร์",
          target: 70000,
          current: 68900,
          percentage: 98.4,
        },
        {
          name: "เทอร์มินอล 21",
          target: 75000,
          current: 72100,
          percentage: 96.1,
        },
        { name: "พารากอน", target: 78000, current: 81200, percentage: 104.1 },
      ],
    },
    {
      id: 2,
      name: "เป้าหมายรายไตรมาส - Q3 2024",
      period: "2024-Q3",
      target: 1200000,
      current: 856000,
      percentage: 71.3,
      daysLeft: 47,
      status: "behind",
      branches: [
        {
          name: "สยามสแควร์",
          target: 255000,
          current: 256000,
          percentage: 100.4,
        },
        {
          name: "เซ็นทรัลเวิลด์",
          target: 240000,
          current: 218000,
          percentage: 90.8,
        },
        {
          name: "เอ็มควอเทียร์",
          target: 210000,
          current: 196000,
          percentage: 93.3,
        },
        {
          name: "เทอร์มินอล 21",
          target: 225000,
          current: 206000,
          percentage: 91.6,
        },
        { name: "พารากอน", target: 234000, current: 234000, percentage: 100.0 },
      ],
    },
    {
      id: 3,
      name: "เป้าหมายรายปี - 2024",
      period: "2024",
      target: 4800000,
      current: 2890000,
      percentage: 60.2,
      daysLeft: 168,
      status: "on-track",
      branches: [
        {
          name: "สยามสแควร์",
          target: 1020000,
          current: 645000,
          percentage: 63.2,
        },
        {
          name: "เซ็นทรัลเวิลด์",
          target: 960000,
          current: 567000,
          percentage: 59.1,
        },
        {
          name: "เอ็มควอเทียร์",
          target: 840000,
          current: 489000,
          percentage: 58.2,
        },
        {
          name: "เทอร์มินอล 21",
          target: 900000,
          current: 523000,
          percentage: 58.1,
        },
        { name: "พารากอน", target: 936000, current: 578000, percentage: 61.8 },
      ],
    },
  ];

  const targetProgress = [
    { day: "1", target: 13333, actual: 12500, cumulative: 12500 },
    { day: "2", target: 26666, actual: 25200, cumulative: 37700 },
    { day: "3", target: 40000, actual: 38900, cumulative: 76600 },
    { day: "4", target: 53333, actual: 51200, cumulative: 127800 },
    { day: "5", target: 66666, actual: 64800, cumulative: 192600 },
    { day: "6", target: 80000, actual: 78200, cumulative: 270800 },
    { day: "7", target: 93333, actual: 91500, cumulative: 362300 },
    { day: "8", target: 106666, actual: 104200, cumulative: 466500 },
    { day: "9", target: 120000, actual: 118900, cumulative: 585400 },
    { day: "10", target: 133333, actual: 131200, cumulative: 716600 },
    { day: "11", target: 146666, actual: 144800, cumulative: 861400 },
    { day: "12", target: 160000, actual: 158200, cumulative: 1019600 },
    { day: "13", target: 173333, actual: 171500, cumulative: 1191100 },
    { day: "14", target: 186666, actual: 184200, cumulative: 1375300 },
    { day: "15", target: 200000, actual: 198900, cumulative: 1574200 },
  ];

  const monthlyTargets = [
    { month: "ม.ค.", target: 350000, actual: 342000, achievement: 97.7 },
    { month: "ก.พ.", target: 370000, actual: 389000, achievement: 105.1 },
    { month: "มี.ค.", target: 360000, actual: 356000, achievement: 98.9 },
    { month: "เม.ย.", target: 380000, actual: 398000, achievement: 104.7 },
    { month: "พ.ค.", target: 390000, actual: 378000, achievement: 96.9 },
    { month: "มิ.ย.", target: 385000, actual: 401000, achievement: 104.2 },
    { month: "ก.ค.", target: 400000, actual: 328500, achievement: 82.1 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "green";
      case "on-track":
        return "blue";
      case "behind":
        return "orange";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "achieved":
        return "บรรลุเป้าหมาย";
      case "on-track":
        return "ตามเป้าหมาย";
      case "behind":
        return "ช้ากว่าเป้า";
      case "critical":
        return "ต้องเร่งด่วน";
      default:
        return "ไม่ทราบ";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "achieved":
        return FiCheckCircle;
      case "on-track":
        return FiTarget;
      case "behind":
        return FiClock;
      case "critical":
        return FiAlertCircle;
      default:
        return FiTarget;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="2xl" mb={2} fontFamily="heading">
            เป้าหมายยอดขาย
          </Heading>
          <Text color="gray.600" fontSize="lg">
            ติดตามและจัดการเป้าหมายยอดขาย
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
            width="180px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
          >
            <option value="current">ปัจจุบัน</option>
            <option value="monthly">รายเดือน</option>
            <option value="quarterly">รายไตรมาส</option>
            <option value="yearly">รายปี</option>
          </Select>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            size="md"
            onClick={onOpen}
          >
            เพิ่มเป้าหมาย
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="gray"
            size="md"
            variant="outline"
          >
            ส่งออก
          </Button>
        </HStack>
      </Flex>

      {/* Current Target Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <VStack spacing={4}>
              <CircularProgress
                value={targets[0].percentage}
                color="blue.400"
                size="100px"
                thickness={8}
              >
                <CircularProgressLabel fontSize="lg" fontWeight="bold">
                  {targets[0].percentage.toFixed(1)}%
                </CircularProgressLabel>
              </CircularProgress>
              <VStack spacing={1}>
                <Text fontWeight="semibold">เป้าหมายเดือนนี้</Text>
                <Text fontSize="sm" color="gray.600">
                  ฿{targets[0].current.toLocaleString()} / ฿
                  {targets[0].target.toLocaleString()}
                </Text>
                <Badge
                  colorScheme={getStatusColor(targets[0].status)}
                  variant="subtle"
                >
                  {getStatusLabel(targets[0].status)}
                </Badge>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <VStack spacing={4}>
              <CircularProgress
                value={targets[1].percentage}
                color="orange.400"
                size="100px"
                thickness={8}
              >
                <CircularProgressLabel fontSize="lg" fontWeight="bold">
                  {targets[1].percentage.toFixed(1)}%
                </CircularProgressLabel>
              </CircularProgress>
              <VStack spacing={1}>
                <Text fontWeight="semibold">เป้าหมายไตรมาส</Text>
                <Text fontSize="sm" color="gray.600">
                  ฿{targets[1].current.toLocaleString()} / ฿
                  {targets[1].target.toLocaleString()}
                </Text>
                <Badge
                  colorScheme={getStatusColor(targets[1].status)}
                  variant="subtle"
                >
                  {getStatusLabel(targets[1].status)}
                </Badge>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <VStack spacing={4}>
              <CircularProgress
                value={targets[2].percentage}
                color="green.400"
                size="100px"
                thickness={8}
              >
                <CircularProgressLabel fontSize="lg" fontWeight="bold">
                  {targets[2].percentage.toFixed(1)}%
                </CircularProgressLabel>
              </CircularProgress>
              <VStack spacing={1}>
                <Text fontWeight="semibold">เป้าหมายปี</Text>
                <Text fontSize="sm" color="gray.600">
                  ฿{targets[2].current.toLocaleString()} / ฿
                  {targets[2].target.toLocaleString()}
                </Text>
                <Badge
                  colorScheme={getStatusColor(targets[2].status)}
                  variant="subtle"
                >
                  {getStatusLabel(targets[2].status)}
                </Badge>
              </VStack>
            </VStack>
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
                วันที่เหลือ (เดือนนี้)
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                {targets[0].daysLeft}
              </StatNumber>
              <StatHelpText color="blue.500" fontSize="sm" fontWeight="medium">
                <Icon as={FiCalendar} mr={1} />
                วัน
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
                ความคืบหน้าเป้าหมายรายวัน
              </Heading>
              <Text fontSize="sm" color="gray.600">
                เปรียบเทียบเป้าหมายกับผลงานจริง
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="400px">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={targetProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#F56565"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="เป้าหมาย"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#3182CE"
                      strokeWidth={3}
                      name="ผลงานจริง"
                    />
                  </LineChart>
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
                ผลงานรายเดือน
              </Heading>
              <Text fontSize="sm" color="gray.600">
                เปอร์เซ็นต์บรรลุเป้าหมาย
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="400px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTargets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="achievement"
                      fill="#3182CE"
                      name="% บรรลุเป้าหมาย"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Target Details */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.100" shadow="lg">
        <CardHeader>
          <Heading size="md" fontFamily="heading">
            รายละเอียดเป้าหมาย
          </Heading>
          <Text fontSize="sm" color="gray.600">
            เป้าหมายทั้งหมดและความคืบหน้า
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {targets.map((target, index) => (
              <Card
                key={index}
                borderRadius="xl"
                border="1px"
                borderColor="gray.100"
              >
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Box
                          p={3}
                          borderRadius="xl"
                          bg={`${getStatusColor(target.status)}.50`}
                          color={`${getStatusColor(target.status)}.600`}
                        >
                          <Icon as={getStatusIcon(target.status)} boxSize={6} />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="lg" fontWeight="bold">
                            {target.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            ระยะเวลา: {target.period}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={4}>
                        <Badge
                          colorScheme={getStatusColor(target.status)}
                          variant="subtle"
                        >
                          {getStatusLabel(target.status)}
                        </Badge>
                        <Button
                          size="sm"
                          leftIcon={<FiEdit />}
                          variant="outline"
                        >
                          แก้ไข
                        </Button>
                      </HStack>
                    </HStack>

                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.600">
                          ฿{target.current.toLocaleString()} / ฿
                          {target.target.toLocaleString()}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.900">
                          {target.percentage.toFixed(1)}%
                        </Text>
                      </HStack>
                      <Progress
                        value={target.percentage}
                        max={100}
                        colorScheme={getStatusColor(target.status)}
                        size="lg"
                        borderRadius="full"
                      />
                    </Box>

                    <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                      {target.branches.map((branch, idx) => (
                        <Box key={idx} p={3} bg="gray.50" borderRadius="md">
                          <VStack spacing={2}>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              noOfLines={1}
                            >
                              {branch.name}
                            </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="gray.900"
                            >
                              {branch.percentage.toFixed(1)}%
                            </Text>
                            <Progress
                              value={branch.percentage}
                              max={110}
                              colorScheme={
                                branch.percentage >= 100 ? "green" : "orange"
                              }
                              size="sm"
                              borderRadius="full"
                              w="100%"
                            />
                          </VStack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Add Target Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>เพิ่มเป้าหมายใหม่</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>ชื่อเป้าหมาย</FormLabel>
                <Input placeholder="กรอกชื่อเป้าหมาย" />
              </FormControl>
              <FormControl>
                <FormLabel>ระยะเวลา</FormLabel>
                <Select placeholder="เลือกระยะเวลา">
                  <option value="monthly">รายเดือน</option>
                  <option value="quarterly">รายไตรมาส</option>
                  <option value="yearly">รายปี</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>ยอดขายเป้าหมาย</FormLabel>
                <Input type="number" placeholder="กรอกยอดขายเป้าหมาย" />
              </FormControl>
              <FormControl>
                <FormLabel>หมายเหตุ</FormLabel>
                <Textarea placeholder="หมายเหตุเพิ่มเติม" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              บันทึก
            </Button>
            <Button variant="ghost" onClick={onClose}>
              ยกเลิก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// Use dashboard layout
SalesTargetsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="เป้าหมายยอดขาย">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(SalesTargetsPage, "staff");
