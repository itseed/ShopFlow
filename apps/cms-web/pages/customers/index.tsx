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
  NumberInput,
  NumberInputField,
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
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../../lib/hooks";
import { Customer, CustomerFormData } from "@shopflow/types";

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

  const { data: customers = [], isLoading, error, refetch } = useCustomers(filters);
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  // Modal states
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Thailand",
    customer_type: "individual",
    status: "active",
    credit_limit: 0,
    notes: "",
  });

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setFormData({
      first_name: "",
      last_name: "",
      company_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postal_code: "",
      country: "Thailand",
      customer_type: "individual",
      status: "active",
      credit_limit: 0,
      notes: "",
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      first_name: customer.first_name || "",
      last_name: "", // API ไม่มี last_name
      company_name: customer.company_name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      postal_code: customer.postal_code || "",
      country: customer.country || "Thailand",
      customer_type: customer.customer_type || "individual",
      status: customer.status || "active",
      credit_limit: customer.credit_limit || 0,
      notes: customer.notes || "",
    });
    setIsEditing(true);
    onFormOpen();
  };

  const handleSaveCustomer = async () => {
    if (!formData.first_name?.trim()) {
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
        // Convert FormData to UpdateCustomerData
        const updateData = {
          name: formData.first_name || 'ไม่ระบุชื่อ',
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          notes: formData.notes,
          isActive: formData.status === 'active',
        };
        await updateCustomerMutation.mutateAsync({
          id: selectedCustomer.id,
          data: updateData,
        });
        toast({
          title: "แก้ไขข้อมูลลูกค้าสำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Convert FormData to CreateCustomerData
        const createData = {
          name: formData.first_name || 'ไม่ระบุชื่อ',
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          notes: formData.notes,
        };
        await createCustomerMutation.mutateAsync(createData);
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
      (c: Customer) => c.id === customerId
    );
    if (!customer) return;

    try {
      await updateCustomerMutation.mutateAsync({
        id: customerId,
        data: {
          isActive: customer.status !== "active",
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
          <AlertDescription>{(error as any).message}</AlertDescription>
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
            isLoading={createCustomerMutation.isPending}
          >
            เพิ่มลูกค้าใหม่
          </Button>
        </HStack>
      </Flex>

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
              isLoading={isLoading}
            >
              กรองข้อมูล
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardBody>
          {isLoading ? (
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
                {customers.map((customer: Customer) => (
                  <Tr key={customer.id}>
                    <Td>
                      <HStack>
                        <Avatar
                          size="sm"
                          name={customer.first_name || 'ไม่ระบุชื่อ'}
                          bg="blue.500"
                          color="white"
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontFamily="body" fontWeight="medium">
                            {customer.first_name || 'ไม่ระบุชื่อ'}
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            fontFamily="body"
                          >
                            {customer.customer_code}
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
                          {customer.total_orders} รายการ
                        </Text>
                        {customer.last_order_date && (
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            fontFamily="body"
                          >
                            ล่าสุด:{" "}
                            {new Date(
                              customer.last_order_date
                            ).toLocaleDateString("th-TH", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td fontFamily="body" fontWeight="semibold">
                      ฿{customer.total_spent.toLocaleString()}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(customer.status === 'active')}
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        <Text fontSize="xs" fontFamily="body">
                          {getStatusText(customer.status === 'active')}
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
                          isLoading={updateCustomerMutation.isPending}
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
                <FormLabel>ชื่อ</FormLabel>
                <Input
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  placeholder="ชื่อ"
                />
              </FormControl>

              <FormControl>
                <FormLabel>นามสกุล</FormLabel>
                <Input
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  placeholder="นามสกุล"
                />
              </FormControl>

              <FormControl>
                <FormLabel>บริษัท</FormLabel>
                <Input
                  value={formData.company_name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      company_name: e.target.value,
                    }))
                  }
                  placeholder="ชื่อบริษัท"
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
                <FormLabel>เมือง</FormLabel>
                <Input
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  placeholder="เมือง"
                />
              </FormControl>

              <FormControl>
                <FormLabel>รหัสไปรษณีย์</FormLabel>
                <Input
                  value={formData.postal_code || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      postal_code: e.target.value,
                    }))
                  }
                  placeholder="รหัสไปรษณีย์"
                />
              </FormControl>

              <FormControl>
                <FormLabel>ประเทศ</FormLabel>
                <Input
                  value={formData.country || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      country: e.target.value,
                    }))
                  }
                  placeholder="ประเทศ"
                />
              </FormControl>

              <FormControl>
                <FormLabel>ประเภทลูกค้า</FormLabel>
                <Select
                  value={formData.customer_type || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customer_type: e.target.value as any,
                    }))
                  }
                  placeholder="เลือกประเภทลูกค้า"
                >
                  <option value="individual">บุคคลธรรมดา</option>
                  <option value="business">นิติบุคคล</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>สถานะ</FormLabel>
                <Select
                  value={formData.status || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  placeholder="เลือกสถานะ"
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                  <option value="vip">VIP</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>วงเงินเครดิต</FormLabel>
                <NumberInput
                  value={formData.credit_limit}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, credit_limit: Number(value) }))
                  }
                  min={0}
                >
                  <NumberInputField placeholder="0" />
                </NumberInput>
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
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onFormClose}
              isLoading={createCustomerMutation.isPending || updateCustomerMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveCustomer}
              leftIcon={<Icon as={FiSave} />}
              isLoading={createCustomerMutation.isPending || updateCustomerMutation.isPending}
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
