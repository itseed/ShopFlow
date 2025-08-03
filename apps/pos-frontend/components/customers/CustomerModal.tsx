import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Avatar,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  useBreakpointValue,
  Flex,
  IconButton,
  Checkbox,
} from "@chakra-ui/react";
import {
  IoSearch,
  IoPersonOutline,
  IoCallOutline,
  IoMailOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEyeOutline,
} from "react-icons/io5";
import { Customer, MembershipType } from "@shopflow/types";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
  selectedCustomer?: Customer | null;
  title?: string;
  mode?: "select" | "view";
  allowMultiSelect?: boolean;
  selectedCustomers?: Customer[];
  onSelectCustomers?: (customers: Customer[]) => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  selectedCustomer,
  title = "เลือกลูกค้า",
  mode = "select",
  allowMultiSelect = false,
  selectedCustomers = [],
  onSelectCustomers,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [localSelectedCustomers, setLocalSelectedCustomers] = useState<Customer[]>(selectedCustomers);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Mock customers data
  const mockCustomers: Customer[] = [
    {
      id: "1",
      customerNumber: "C001",
      name: "สมชาย ใจดี",
      email: "somchai@email.com",
      phone: "0812345678",
      address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
      dateOfBirth: new Date("1985-05-15"),
      gender: "male",
      isActive: true,
      membership: {
        id: "1",
        customerId: "1",
        membershipType: {
          id: "1",
          name: "Gold",
          color: "yellow",
          benefits: ["ส่วนลด 10%", "แต้มสะสม x2"],
          minSpent: 50000,
          discountPercentage: 10,
          pointsMultiplier: 2,
          description: "สมาชิกระดับทอง",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        membershipNumber: "M0001",
        points: 1250,
        totalSpent: 75000,
        discountPercentage: 10,
        joinedAt: new Date("2023-01-15"),
        status: "active",
        expiresAt: new Date("2024-12-31"),
      },
      notes: "ลูกค้า VIP",
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date("2024-01-10"),
    },
    {
      id: "2",
      customerNumber: "C002",
      name: "สมหญิง รักสวย",
      email: "somying@email.com",
      phone: "0812345679",
      isActive: true,
      membership: {
        id: "2",
        customerId: "2",
        membershipType: {
          id: "2",
          name: "Silver",
          color: "gray",
          benefits: ["ส่วนลด 5%", "แต้มสะสม x1.5"],
          minSpent: 25000,
          discountPercentage: 5,
          pointsMultiplier: 1.5,
          description: "สมาชิกระดับเงิน",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        membershipNumber: "M0002",
        points: 800,
        totalSpent: 35000,
        discountPercentage: 5,
        joinedAt: new Date("2023-03-20"),
        status: "active",
        expiresAt: new Date("2024-12-31"),
      },
      createdAt: new Date("2023-03-20"),
      updatedAt: new Date("2024-01-08"),
    },
    {
      id: "3",
      customerNumber: "C003",
      name: "อนุชา ทำงานหนัก",
      email: "anucha@email.com",
      phone: "0812345680",
      isActive: true,
      createdAt: new Date("2023-06-10"),
      updatedAt: new Date("2024-01-05"),
    },
    {
      id: "4",
      customerNumber: "C004",
      name: "วิภา ขยันเรียน",
      email: "wipha@email.com",
      phone: "0812345681",
      gender: "female",
      isActive: true,
      createdAt: new Date("2023-08-15"),
      updatedAt: new Date("2024-01-03"),
    },
  ];

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCustomers(mockCustomers);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleSelectCustomer = (customer: Customer) => {
    if (allowMultiSelect) {
      const isSelected = localSelectedCustomers.some(c => c.id === customer.id);
      let newSelection: Customer[];
      
      if (isSelected) {
        newSelection = localSelectedCustomers.filter(c => c.id !== customer.id);
      } else {
        newSelection = [...localSelectedCustomers, customer];
      }
      
      setLocalSelectedCustomers(newSelection);
    } else {
      onSelectCustomer(customer);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    if (onSelectCustomers) {
      onSelectCustomers(localSelectedCustomers);
    }
    onClose();
  };

  const isCustomerSelected = (customer: Customer) => {
    if (allowMultiSelect) {
      return localSelectedCustomers.some(c => c.id === customer.id);
    }
    return selectedCustomer?.id === customer.id;
  };

  const formatCustomerInfo = (customer: Customer) => {
    const info = [];
    if (customer.phone) info.push(customer.phone);
    if (customer.email) info.push(customer.email);
    return info.join(" • ");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isMobile ? "full" : "2xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <IoPersonOutline size={24} />
            <Text>{title}</Text>
            {allowMultiSelect && localSelectedCustomers.length > 0 && (
              <Badge colorScheme="blue" variant="solid">
                เลือกแล้ว {localSelectedCustomers.length}
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Search */}
            <InputGroup>
              <InputLeftElement>
                <IoSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="ค้นหาลูกค้า (ชื่อ, รหัส, โทรศัพท์, อีเมล)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
              />
            </InputGroup>

            {/* Customer List */}
            <Box minH="400px">
              {loading ? (
                <Center py={10}>
                  <VStack spacing={3}>
                    <Spinner size="lg" />
                    <Text color="gray.500">กำลังโหลดข้อมูลลูกค้า...</Text>
                  </VStack>
                </Center>
              ) : filteredCustomers.length === 0 ? (
                <Center py={10}>
                  <Alert status="info" maxW="md">
                    <AlertIcon />
                    <Box>
                      <Text>
                        {searchTerm
                          ? "ไม่พบลูกค้าที่ตรงกับคำค้นหา"
                          : "ไม่มีข้อมูลลูกค้า"}
                      </Text>
                    </Box>
                  </Alert>
                </Center>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        {allowMultiSelect && <Th w="50px"></Th>}
                        <Th>ลูกค้า</Th>
                        <Th>ข้อมูลติดต่อ</Th>
                        <Th>สมาชิก</Th>
                        <Th>สถานะ</Th>
                        <Th>จัดการ</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredCustomers.map((customer) => (
                        <Tr
                          key={customer.id}
                          _hover={{ bg: hoverBg }}
                          bg={isCustomerSelected(customer) ? "blue.50" : "transparent"}
                          cursor="pointer"
                          onClick={() => !allowMultiSelect && handleSelectCustomer(customer)}
                        >
                          {allowMultiSelect && (
                            <Td>
                              <Checkbox
                                isChecked={isCustomerSelected(customer)}
                                onChange={() => handleSelectCustomer(customer)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Td>
                          )}
                          <Td>
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={customer.name}
                                bg="blue.500"
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium" fontSize="sm">
                                  {customer.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {customer.customerNumber}
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              {customer.phone && (
                                <HStack spacing={1}>
                                  <IoCallOutline size={12} />
                                  <Text fontSize="xs">{customer.phone}</Text>
                                </HStack>
                              )}
                              {customer.email && (
                                <HStack spacing={1}>
                                  <IoMailOutline size={12} />
                                  <Text fontSize="xs">{customer.email}</Text>
                                </HStack>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            {customer.membership ? (
                              <Badge
                                colorScheme={customer.membership.membershipType.color}
                                variant="solid"
                                size="sm"
                              >
                                {customer.membership.membershipType.name}
                              </Badge>
                            ) : (
                              <Text fontSize="xs" color="gray.500">
                                ไม่เป็นสมาชิก
                              </Text>
                            )}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={customer.isActive ? "green" : "red"}
                              variant="outline"
                              size="sm"
                            >
                              {customer.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              {!allowMultiSelect && (
                                <IconButton
                                  aria-label="เลือกลูกค้า"
                                  icon={<IoCheckmarkCircleOutline />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCustomer(customer);
                                  }}
                                />
                              )}
                              <IconButton
                                aria-label="ดูรายละเอียด"
                                icon={<IoEyeOutline />}
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle view customer details
                                }}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Text fontSize="sm" color="gray.500">
              {filteredCustomers.length} ลูกค้า
            </Text>
            <Button variant="ghost" onClick={onClose}>
              ยกเลิก
            </Button>
            {allowMultiSelect && (
              <Button
                colorScheme="blue"
                onClick={handleConfirmSelection}
                isDisabled={localSelectedCustomers.length === 0}
              >
                เลือก ({localSelectedCustomers.length})
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomerModal;