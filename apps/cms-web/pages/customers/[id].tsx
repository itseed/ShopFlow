import React, { useState, useEffect } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import { useRouter } from "next/router";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Avatar,
  Divider,
  NumberInput,
  NumberInputField,
  Select,
  Textarea,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiEdit2,
  FiShoppingCart,
  FiCalendar,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useCustomer, useOrders, useUpdateCustomer } from "../../lib/hooks";
import { Customer, Order } from "@shopflow/types";

const CustomerDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: customer, isLoading, error } = useCustomer(id as string);
  const { data: orders = [], isLoading: ordersLoading } = useOrders({ customerId: id as string });
  const updateCustomerMutation = useUpdateCustomer();

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  useEffect(() => {
    if (customer) {
      setEditFormData({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        company_name: customer.company_name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        postal_code: customer.postal_code || "",
        country: customer.country || "",
        customer_type: customer.customer_type || "individual",
        status: customer.status || "active",
        credit_limit: customer.credit_limit || 0,
        notes: customer.notes || "",
      });
    }
  }, [customer]);

  const handleEditSave = async () => {
    if (!customer) return;

    await updateCustomerMutation.mutateAsync({
      id: customer.id,
      data: editFormData,
    });
    onEditClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "processing":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "สำเร็จ";
      case "processing":
        return "กำลังดำเนินการ";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>กำลังโหลดข้อมูลลูกค้า...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} textAlign="center">
        <Alert status="error">
          <AlertIcon />
          <Text>{error instanceof Error ? error.message : "เกิดข้อผิดพลาด"}</Text>
        </Alert>
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box p={8} textAlign="center">
        <Alert status="warning">
          <AlertIcon />
          <Text>ไม่พบข้อมูลลูกค้า</Text>
        </Alert>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <HStack spacing={4}>
          <IconButton
            aria-label="กลับ"
            icon={<FiArrowLeft />}
            onClick={() => router.back()}
            variant="ghost"
          />
          <VStack align="start" spacing={0}>
            <Heading size="lg">ข้อมูลลูกค้า</Heading>
            <Text color="gray.500">รายละเอียดและประวัติการซื้อ</Text>
          </VStack>
        </HStack>
        <Button leftIcon={<FiEdit2 />} colorScheme="blue" onClick={onEditOpen}>
          แก้ไขข้อมูล
        </Button>
      </HStack>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <HStack spacing={4}>
            <Avatar size="lg" name={`${customer.first_name} ${customer.last_name}`} bg="blue.500" />
            <VStack align="start" spacing={1}>
              <Heading size="md">{`${customer.first_name} ${customer.last_name}`}</Heading>
              <HStack spacing={4}>
                <HStack spacing={1}>
                  <FiMail />
                  <Text fontSize="sm" color="gray.600">
                    {customer.email}
                  </Text>
                </HStack>
                <HStack spacing={1}>
                  <FiPhone />
                  <Text fontSize="sm" color="gray.600">
                    {customer.phone}
                  </Text>
                </HStack>
              </HStack>
              <Badge colorScheme="green">{customer.status}</Badge>
            </VStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Stat>
              <StatLabel>จำนวนออเดอร์ทั้งหมด</StatLabel>
              <StatNumber>{customer.total_orders}</StatNumber>
              <StatHelpText>ครั้ง</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>ยอดซื้อทั้งหมด</StatLabel>
              <StatNumber>฿{customer.total_spent.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +12%
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>ยอดซื้อเฉลี่ย</StatLabel>
              <StatNumber>
                ฿{(customer.total_spent / (customer.total_orders || 1)).toLocaleString()}
              </StatNumber>
              <StatHelpText>ต่อออเดอร์</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>ซื้อล่าสุด</StatLabel>
              <StatNumber fontSize="md">
                {customer.last_order_date && formatDistanceToNow(new Date(customer.last_order_date), {
                  addSuffix: true,
                  locale: th,
                })}
              </StatNumber>
              <StatHelpText>
                {customer.last_order_date && new Date(customer.last_order_date).toLocaleDateString("th-TH")}
              </StatHelpText>
            </Stat>
          </SimpleGrid>

          <Divider my={6} />

          <VStack align="start" spacing={3}>
            <HStack spacing={1}>
              <FiMapPin />
              <Text fontWeight="semibold">ที่อยู่:</Text>
            </HStack>
            <Text color="gray.600" pl={6}>
              {customer.address}, {customer.city}, {customer.postal_code}, {customer.country}
            </Text>

            {customer.notes && (
              <>
                <Text fontWeight="semibold" mt={4}>
                  หมายเหตุ:
                </Text>
                <Text color="gray.600" pl={6}>
                  {customer.notes}
                </Text>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Orders History */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">ประวัติการสั่งซื้อ</Heading>
            <Badge variant="outline">{orders.length} รายการ</Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          {ordersLoading ? (
            <Flex justify="center" p={8}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>เลขที่ออเดอร์</Th>
                  <Th>วันที่สั่ง</Th>
                  <Th>จำนวนสินค้า</Th>
                  <Th>ยอดรวม</Th>
                  <Th>สถานะ</Th>
                  <Th>การดำเนินการ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order: Order) => (
                  <Tr key={order.id}>
                    <Td>
                      <Text fontWeight="semibold">{order.order_number}</Text>
                    </Td>
                    <Td>
                      <Text>
                        {new Date(order.created_at || "").toLocaleDateString("th-TH")}
                      </Text>
                    </Td>
                    <Td>
                      <Text>{order.items?.length} รายการ</Text>
                    </Td>
                    <Td>
                      <Text fontWeight="semibold">
                        ฿{order.total.toLocaleString()}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FiShoppingCart />}
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        ดูรายละเอียด
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Edit Customer Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>แก้ไขข้อมูลลูกค้า</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>ชื่อ</FormLabel>
                <Input
                  value={editFormData.first_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      first_name: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>นามสกุล</FormLabel>
                <Input
                  value={editFormData.last_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      last_name: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>บริษัท</FormLabel>
                <Input
                  value={editFormData.company_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      company_name: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>อีเมล</FormLabel>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      email: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>เบอร์โทรศัพท์</FormLabel>
                <Input
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      phone: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>ที่อยู่</FormLabel>
                <Input
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      address: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>เมือง</FormLabel>
                <Input
                  value={editFormData.city}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      city: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>รหัสไปรษณีย์</FormLabel>
                <Input
                  value={editFormData.postal_code}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      postal_code: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>ประเทศ</FormLabel>
                <Input
                  value={editFormData.country}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      country: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>ประเภทลูกค้า</FormLabel>
                <Select
                  value={editFormData.customer_type}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      customer_type: e.target.value as "individual" | "business" | "regular" | "vip" | "wholesale",
                    })
                  }
                >
                  <option value="individual">บุคคลธรรมดา</option>
                  <option value="business">นิติบุคคล</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>สถานะ</FormLabel>
                <Select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as "active" | "inactive" | "vip",
                    })
                  }
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                  <option value="vip">VIP</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>วงเงินเครดิต</FormLabel>
                <NumberInput
                  value={editFormData.credit_limit}
                  onChange={(_, value) =>
                    setEditFormData({
                      ...editFormData,
                      credit_limit: Number(value),
                    })
                  }
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>หมายเหตุ</FormLabel>
                <Textarea
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      notes: e.target.value,
                    })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

const CustomerDetail: NextPageWithLayout = () => {
  return <CustomerDetailPage />;
};

CustomerDetail.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายละเอียดลูกค้า">{page}</Layout>;
};

export default withAuth(CustomerDetail);