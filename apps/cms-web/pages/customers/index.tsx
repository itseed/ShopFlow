import { ReactElement, useState } from "react";
import { useRouter } from "next/router";
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
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  Switch,
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
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import {
  useCustomers,
  useCustomerStats,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../../lib/hooks/useCustomers";

// Customer with stats type
interface CustomerWithStats {
  id: string;
  customerNumber: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  orderCount: number;
}

interface CustomerFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  notes?: string;
  isActive?: boolean;
}

const getStatusColor = (isActive: boolean) => {
  return isActive ? "green" : "gray";
};

const getStatusText = (isActive: boolean) => {
  return isActive ? "ใช้งานอยู่" : "ไม่ใช้งาน";
};

function CustomersPage() {
  const router = useRouter();
  const toast = useToast();

  // Real Supabase hooks
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const filters = {
    search: searchTerm,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
  };

  const { customers, loading, error, refetch } = useCustomers(filters);
  const { stats, loading: statsLoading } = useCustomerStats();
  const { createCustomer, isCreating } = useCreateCustomer();
  const { updateCustomer, isUpdating } = useUpdateCustomer();
  const { deleteCustomer, isDeleting } = useDeleteCustomer();

  // Modal states
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithStats | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    gender: undefined,
    notes: "",
    isActive: true,
  });

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      gender: undefined,
      notes: "",
      isActive: true,
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleEditCustomer = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      gender: customer.gender,
      notes: customer.notes || "",
      isActive: customer.isActive,
    });
    setIsEditing(true);
    onFormOpen();
  };

  const handleSaveCustomer = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "กรุณากรอกชื่อลูกค้า",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (isEditing && selectedCustomer) {
        await updateCustomer({
          id: selectedCustomer.id,
          data: {
            name: formData.name,
            phone: formData.phone || undefined,
            email: formData.email || undefined,
            address: formData.address || undefined,
            gender: formData.gender,
            notes: formData.notes || undefined,
            isActive: formData.isActive,
          },
        });
        toast({
          title: "แก้ไขข้อมูลลูกค้าสำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await createCustomer({
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          gender: formData.gender,
          notes: formData.notes || undefined,
          isActive: formData.isActive,
        });
        toast({
          title: "เพิ่มลูกค้าใหม่สำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      onFormClose();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleStatus = async (customerId: string) => {
    const customer = customers.find(
      (c: CustomerWithStats) => c.id === customerId
    );
    if (!customer) return;

    try {
      await updateCustomer({
        id: customerId,
        data: {
          isActive: !customer.isActive,
        },
      });
      toast({
        title: "เปลี่ยนสถานะลูกค้าสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error ? error.message : "ไม่สามารถเปลี่ยนสถานะได้",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleViewCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Error Alert */}
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FiUserPlus} />}
            onClick={handleAddCustomer}
            isDisabled={isCreating}
          >
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
              <StatNumber fontFamily="heading">
                {statsLoading ? <Spinner size="sm" /> : stats.total}
              </StatNumber>
              <StatHelpText fontFamily="body">คน</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">ใช้งานอยู่</StatLabel>
              <StatNumber fontFamily="heading" color="green.500">
                {statsLoading ? <Spinner size="sm" /> : stats.active}
              </StatNumber>
              <StatHelpText fontFamily="body">คน</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">ลูกค้าใหม่เดือนนี้</StatLabel>
              <StatNumber fontFamily="heading" color="blue.500">
                {statsLoading ? <Spinner size="sm" /> : stats.newThisMonth}
              </StatNumber>
              <StatHelpText fontFamily="body">คน</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontFamily="body">ยอดขายรวม</StatLabel>
              <StatNumber fontFamily="heading" color="purple.500">
                {statsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  `฿${stats.totalRevenue.toLocaleString()}`
                )}
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
              <Input
                placeholder="ค้นหาลูกค้า..."
                fontFamily="body"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              placeholder="สถานะทั้งหมด"
              maxW="200px"
              fontFamily="body"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">ทั้งหมด</option>
              <option value="active">ใช้งานอยู่</option>
              <option value="inactive">ไม่ใช้งาน</option>
            </Select>

            <Button
              leftIcon={<Icon as={FiFilter} />}
              variant="outline"
              onClick={() => refetch()}
              isLoading={loading}
            >
              กรองข้อมูล
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardBody>
          {loading ? (
            <Flex justify="center" p={8}>
              <Spinner size="lg" />
            </Flex>
          ) : (
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
                {customers.map((customer: CustomerWithStats) => (
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
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            fontFamily="body"
                          >
                            {customer.customerNumber}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        {customer.email && (
                          <HStack>
                            <Icon as={FiMail} boxSize={3} color="gray.400" />
                            <Text fontSize="sm" fontFamily="body">
                              {customer.email}
                            </Text>
                          </HStack>
                        )}
                        {customer.phone && (
                          <HStack>
                            <Icon as={FiPhone} boxSize={3} color="gray.400" />
                            <Text fontSize="sm" fontFamily="body">
                              {customer.phone}
                            </Text>
                          </HStack>
                        )}
                        {!customer.email && !customer.phone && (
                          <Text
                            fontSize="sm"
                            color="gray.400"
                            fontFamily="body"
                          >
                            ไม่ระบุ
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td maxW="200px">
                      {customer.address ? (
                        <HStack align="start">
                          <Icon
                            as={FiMapPin}
                            boxSize={3}
                            color="gray.400"
                            mt={1}
                          />
                          <Text fontSize="sm" fontFamily="body" noOfLines={2}>
                            {customer.address}
                          </Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400" fontFamily="body">
                          ไม่ระบุ
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontFamily="body" fontWeight="semibold">
                          {customer.totalOrders} รายการ
                        </Text>
                        {customer.lastOrderDate && (
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            fontFamily="body"
                          >
                            ล่าสุด:{" "}
                            {new Date(
                              customer.lastOrderDate
                            ).toLocaleDateString("th-TH", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td fontFamily="body" fontWeight="semibold">
                      ฿{customer.totalSpent.toLocaleString()}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(customer.isActive)}
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        <Text fontSize="xs" fontFamily="body">
                          {getStatusText(customer.isActive)}
                        </Text>
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Icon as={FiEye} />}
                          onClick={() => handleViewCustomer(customer.id)}
                        >
                          ดู
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Icon as={FiEdit} />}
                          onClick={() => handleEditCustomer(customer)}
                          isDisabled={isUpdating}
                        >
                          แก้ไข
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
      {/* Customer Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>ชื่อลูกค้า</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="ชื่อและนามสกุล"
                />
              </FormControl>

              <FormControl>
                <FormLabel>เบอร์โทรศัพท์</FormLabel>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="081-234-5678"
                />
              </FormControl>

              <FormControl>
                <FormLabel>อีเมล</FormLabel>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="customer@example.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>ที่อยู่</FormLabel>
                <Textarea
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="ที่อยู่ของลูกค้า"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>เพศ</FormLabel>
                <Select
                  value={formData.gender || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gender: e.target.value as any,
                    }))
                  }
                  placeholder="เลือกเพศ"
                >
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>หมายเหตุ</FormLabel>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="บันทึกเพิ่มเติม..."
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={formData.isActive !== false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    colorScheme="green"
                  />
                  <Text>สถานะการใช้งาน</Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onFormClose}
              isDisabled={isCreating || isUpdating}
            >
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveCustomer}
              leftIcon={<Icon as={FiSave} />}
              isLoading={isCreating || isUpdating}
              loadingText="กำลังบันทึก..."
            >
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

// Use layout
CustomersPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="ลูกค้า">{page}</Layout>;
};

export default withAuth(CustomersPage, "staff");
