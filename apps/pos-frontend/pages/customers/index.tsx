import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  Textarea,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Divider,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Icon,
  Progress,
  Flex,
  AlertTitle,
  AlertDescription,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  IoAdd,
  IoEye,
  IoMail,
  IoCall,
  IoLocation,
  IoEllipsisVertical,
  IoStar,
  IoRefresh,
  IoDownload,
  IoPrint,
  IoPerson,
  IoCard,
  IoTime,
  IoPeople,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoWarning,
  IoSearch,
  IoFilter,
  IoCash,
  IoGift,
  IoCalendar,
  IoDocumentText,
  IoChatbubble,
  IoNotifications,
} from "react-icons/io5";
import { POSLayout } from "../../components";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  membershipLevel: "bronze" | "silver" | "gold" | "platinum";
  points: number;
  totalSpent: number;
  visitCount: number;
  lastVisit: Date;
  createdAt: Date;
  isActive: boolean;
  notes: string;
}

interface CustomerTransaction {
  id: string;
  customerId: string;
  orderId: string;
  amount: number;
  pointsEarned: number;
  pointsUsed: number;
  date: Date;
  items: string[];
}

const mockCustomers: Customer[] = [
  {
    id: "CUST001",
    firstName: "สมชาย",
    lastName: "ใจดี",
    email: "somchai@email.com",
    phone: "081-234-5678",
    address: "123 ถนนสุขุมวิท, กรุงเทพฯ",
    membershipLevel: "gold",
    points: 1250,
    totalSpent: 45000,
    visitCount: 15,
    lastVisit: new Date("2024-01-15"),
    createdAt: new Date("2023-06-01"),
    isActive: true,
    notes: "ลูกค้าประจำ ชอบกาแฟเย็น",
  },
  {
    id: "CUST002",
    firstName: "สมหญิง",
    lastName: "รักดี",
    email: "somying@email.com",
    phone: "089-876-5432",
    address: "456 ถนนรัชดาภิเษก, กรุงเทพฯ",
    membershipLevel: "silver",
    points: 750,
    totalSpent: 28000,
    visitCount: 8,
    lastVisit: new Date("2024-01-10"),
    createdAt: new Date("2023-08-15"),
    isActive: true,
    notes: "ชอบขนมปังสด",
  },
  {
    id: "CUST003",
    firstName: "วิชัย",
    lastName: "มั่งมี",
    email: "wichai@email.com",
    phone: "082-555-1234",
    address: "789 ถนนเพชรบุรี, กรุงเทพฯ",
    membershipLevel: "platinum",
    points: 3200,
    totalSpent: 89000,
    visitCount: 25,
    lastVisit: new Date("2024-01-18"),
    createdAt: new Date("2023-03-01"),
    isActive: true,
    notes: "ลูกค้า VIP ชอบสั่งเป็นชุดใหญ่",
  },
];

const mockTransactions: CustomerTransaction[] = [
  {
    id: "TXN001",
    customerId: "CUST001",
    orderId: "ORD001",
    amount: 150,
    pointsEarned: 15,
    pointsUsed: 0,
    date: new Date("2024-01-15"),
    items: ["กาแฟเย็น", "ขนมปัง"],
  },
  {
    id: "TXN002",
    customerId: "CUST002",
    orderId: "ORD002",
    amount: 200,
    pointsEarned: 20,
    pointsUsed: 50,
    date: new Date("2024-01-10"),
    items: ["น้ำส้ม", "เค้ก"],
  },
];

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>(mockTransactions);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filter, setFilter] = useState("all");
  
  const { isOpen: isAddCustomerOpen, onOpen: onAddCustomerOpen, onClose: onAddCustomerClose } = useDisclosure();
  const { isOpen: isEditCustomerOpen, onOpen: onEditCustomerOpen, onClose: onEditCustomerClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const { isOpen: isSendMessageOpen, onOpen: onSendMessageOpen, onClose: onSendMessageClose } = useDisclosure();
  
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  
  const [messageType, setMessageType] = useState<"sms" | "email">("sms");
  const [messageContent, setMessageContent] = useState("");
  
  const toast = useToast();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Mock customer stats
  const customerStats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.isActive).length,
    newCustomersThisMonth: 12,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length,
    totalPoints: customers.reduce((sum, c) => sum + c.points, 0),
    platinumMembers: customers.filter(c => c.membershipLevel === "platinum").length,
  };

  const filteredCustomers = customers.filter(customer => 
    (customer.firstName + " " + customer.lastName).toLowerCase().includes(search.toLowerCase()) &&
    (filter === "all" || customer.membershipLevel === filter)
  );

  const handleAddCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const customer: Customer = {
      id: `CUST${Date.now()}`,
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      membershipLevel: "bronze",
      points: 0,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: new Date(),
      createdAt: new Date(),
      isActive: true,
      notes: newCustomer.notes,
    };

    setCustomers([customer, ...customers]);
    
    toast({
      title: "เพิ่มลูกค้าเรียบร้อย",
      description: `${customer.firstName} ${customer.lastName}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onAddCustomerClose();
    setNewCustomer({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
  };

  const handleSendMessage = () => {
    if (!selectedCustomer || !messageContent) {
      toast({
        title: "กรุณากรอกข้อความ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "ส่งข้อความเรียบร้อย",
      description: `ส่ง${messageType === "sms" ? "SMS" : "อีเมล"}ไปยัง ${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onSendMessageClose();
    setMessageContent("");
    setSelectedCustomer(null);
  };

  const getMembershipColor = (level: string) => {
    switch (level) {
      case "bronze": return "orange";
      case "silver": return "gray";
      case "gold": return "yellow";
      case "platinum": return "purple";
      default: return "gray";
    }
  };

  const getMembershipText = (level: string) => {
    switch (level) {
      case "bronze": return "Bronze";
      case "silver": return "Silver";
      case "gold": return "Gold";
      case "platinum": return "Platinum";
      default: return "Unknown";
    }
  };

  const getCustomerTransactions = (customerId: string) => {
    return transactions.filter(txn => txn.customerId === customerId);
  };

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
          <Flex justify="space-between" align="center" position="relative" zIndex={1}>
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                >
                  <Icon as={IoPeople} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" fontWeight="bold">
                    👥 จัดการลูกค้า
                  </Heading>
                  <Text fontSize="lg" opacity={0.9}>
                    ข้อมูลลูกค้าและระบบสมาชิก
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={4}>
                <Badge colorScheme="green" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoCheckmarkCircle} />
                    <Text>{customerStats.activeCustomers} ลูกค้าที่ใช้งาน</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="purple" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoStar} />
                    <Text>{customerStats.platinumMembers} Platinum</Text>
                  </HStack>
                </Badge>
              </HStack>
            </VStack>
            <VStack spacing={3}>
              <HStack spacing={2}>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<IoDownload />}
                  bg="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.3)" }}
                  color="white"
                >
                  Export
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<IoPrint />}
                  bg="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.3)" }}
                  color="white"
                >
                  Print
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">ลูกค้าทั้งหมด</Text>
                  <Icon as={IoPeople} color="blue.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {customerStats.totalCustomers}
                </Text>
                <Text fontSize="sm" color="gray.500">คน</Text>
                <Progress value={85} colorScheme="blue" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">ยอดขายรวม</Text>
                  <Icon as={IoCash} color="green.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  ฿{customerStats.totalRevenue.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.500">บาท</Text>
                <Progress value={75} colorScheme="green" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">คะแนนรวม</Text>
                  <Icon as={IoGift} color="purple.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                  {customerStats.totalPoints.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.500">คะแนน</Text>
                <Progress value={60} colorScheme="purple" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">ลูกค้าใหม่</Text>
                  <Icon as={IoTrendingUp} color="orange.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                  {customerStats.newCustomersThisMonth}
                </Text>
                <Text fontSize="sm" color="gray.500">คน/เดือน</Text>
                <Progress value={90} colorScheme="orange" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Search and Filters */}
        <Card bg={cardBg} borderColor={borderColor} shadow="lg">
          <CardBody>
            <VStack spacing={4}>
              <HStack w="full" spacing={4}>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={IoSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="ค้นหาลูกค้า..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                  />
                </InputGroup>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  size="lg"
                  w="200px"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </Select>
                <Button
                  colorScheme="blue"
                  leftIcon={<IoAdd />}
                  onClick={onAddCustomerOpen}
                  size="lg"
                >
                  เพิ่มลูกค้า
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Customers Table */}
        <Card bg={cardBg} borderColor={borderColor} shadow="lg">
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <Heading size="md" color="gray.700">
                  รายการลูกค้า ({filteredCustomers.length})
                </Heading>
                <HStack spacing={2}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<IoRefresh />}
                  >
                    รีเฟรช
                  </Button>
                </HStack>
              </HStack>
              
              <Box overflowX="auto" w="full">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ลูกค้า</Th>
                      <Th>สมาชิก</Th>
                      <Th>คะแนน</Th>
                      <Th>ยอดซื้อ</Th>
                      <Th>ครั้งล่าสุด</Th>
                      <Th>สถานะ</Th>
                      <Th>การดำเนินการ</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCustomers.map((customer) => (
                      <Tr key={customer.id}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar 
                              name={`${customer.firstName} ${customer.lastName}`}
                              size="md"
                              bg={getMembershipColor(customer.membershipLevel) + ".100"}
                              color={getMembershipColor(customer.membershipLevel) + ".600"}
                            />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">
                                {customer.firstName} {customer.lastName}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {customer.email}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {customer.phone}
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getMembershipColor(customer.membershipLevel)} variant="subtle">
                            {getMembershipText(customer.membershipLevel)}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="purple.500">
                              {customer.points.toLocaleString()}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              คะแนน
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="green.500">
                              ฿{customer.totalSpent.toLocaleString()}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {customer.visitCount} ครั้ง
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {customer.lastVisit.toLocaleDateString()}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {Math.floor((Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24))} วันที่แล้ว
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={customer.isActive ? "green" : "red"} variant="subtle">
                            {customer.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                          </Badge>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<IoEllipsisVertical />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem
                                icon={<IoEye />}
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  onHistoryOpen();
                                }}
                              >
                                ดูประวัติ
                              </MenuItem>
                              <MenuItem
                                icon={<IoMail />}
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setMessageType("email");
                                  onSendMessageOpen();
                                }}
                              >
                                ส่งอีเมล
                              </MenuItem>
                              <MenuItem
                                icon={<IoCall />}
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setMessageType("sms");
                                  onSendMessageOpen();
                                }}
                              >
                                ส่ง SMS
                              </MenuItem>
                              <MenuItem
                                icon={<IoPerson />}
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  onEditCustomerOpen();
                                }}
                              >
                                แก้ไขข้อมูล
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Add Customer Modal */}
        <Modal isOpen={isAddCustomerOpen} onClose={onAddCustomerClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>เพิ่มลูกค้าใหม่</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <HStack w="full" spacing={4}>
                  <FormControl>
                    <FormLabel>ชื่อ</FormLabel>
                    <Input
                      placeholder="ชื่อ"
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>นามสกุล</FormLabel>
                    <Input
                      placeholder="นามสกุล"
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                    />
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel>อีเมล</FormLabel>
                  <Input
                    type="email"
                    placeholder="อีเมล"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>เบอร์โทร</FormLabel>
                  <Input
                    placeholder="เบอร์โทร"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>ที่อยู่</FormLabel>
                  <Textarea
                    placeholder="ที่อยู่"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>หมายเหตุ</FormLabel>
                  <Textarea
                    placeholder="หมายเหตุ"
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddCustomerClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="blue" onClick={handleAddCustomer}>
                เพิ่มลูกค้า
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* History Modal */}
        <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>ประวัติการซื้อ - {selectedCustomer?.firstName} {selectedCustomer?.lastName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {selectedCustomer && getCustomerTransactions(selectedCustomer.id).map((txn) => (
                  <Box key={txn.id} p={4} borderWidth={1} borderRadius="md">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={IoCard} color="green.500" />
                          <Text fontWeight="bold">
                            ฿{txn.amount.toLocaleString()}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {txn.items.join(", ")}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          +{txn.pointsEarned} คะแนน
                          {txn.pointsUsed > 0 && `, -${txn.pointsUsed} คะแนน`}
                        </Text>
                      </VStack>
                      <Text fontSize="sm" color="gray.500">
                        {txn.date.toLocaleDateString()}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Send Message Modal */}
        <Modal isOpen={isSendMessageOpen} onClose={onSendMessageClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              ส่ง{messageType === "sms" ? "SMS" : "อีเมล"} - {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <HStack w="full" spacing={4}>
                  <Button
                    variant={messageType === "sms" ? "solid" : "ghost"}
                    colorScheme="blue"
                    onClick={() => setMessageType("sms")}
                    leftIcon={<IoCall />}
                  >
                    SMS
                  </Button>
                  <Button
                    variant={messageType === "email" ? "solid" : "ghost"}
                    colorScheme="blue"
                    onClick={() => setMessageType("email")}
                    leftIcon={<IoMail />}
                  >
                    อีเมล
                  </Button>
                </HStack>
                <Textarea
                  placeholder={`ข้อความ${messageType === "sms" ? "SMS" : "อีเมล"}`}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={6}
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onSendMessageClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="blue" onClick={handleSendMessage}>
                ส่งข้อความ
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </POSLayout>
  );
};

export default CustomersPage;
