import React, { useState, useMemo } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../_app";
import Layout from "../../../components/Layout";
import { withAuth } from "../../../lib/auth";
import {
  useSuppliers,
  useSupplierStats,
  useCreateSupplier,
  useUpdateSupplier,
} from "../../../lib/hooks/useSuppliers";
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
  SimpleGrid,
  Icon,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  useToast,
  InputGroup,
  InputLeftElement,
  Switch,
  FormHelperText,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiUsers,
  FiTruck,
  FiStar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiMoreVertical,
  FiEdit,
  FiEye,
  FiSearch,
  FiSave,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { CreateSupplierData, UpdateSupplierData } from "@shopflow/api";

const SupplierManagementPage: NextPageWithLayout = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "suspended" | ""
  >("");
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<
    CreateSupplierData & UpdateSupplierData
  >({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Thailand",
    tax_id: "",
    payment_terms: "",
    credit_limit: 0,
    rating: 5,
    notes: "",
    status: "active",
  });

  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  // API hooks
  const { suppliers, loading, error, refetch } = useSuppliers({
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });
  const { stats, loading: statsLoading } = useSupplierStats();
  const { createSupplier, isCreating } = useCreateSupplier();
  const { updateSupplier, isUpdating } = useUpdateSupplier();

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter((supplier) => {
      const matchesSearch =
        !searchTerm ||
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supplier.supplier_code
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  const handleAddSupplier = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postal_code: "",
      country: "Thailand",
      tax_id: "",
      payment_terms: "",
      credit_limit: 0,
      rating: 5,
      notes: "",
      status: "active",
    });
    onFormOpen();
  };

  const handleEditSupplier = (supplier: any) => {
    setIsEditing(true);
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      city: supplier.city || "",
      postal_code: supplier.postal_code || "",
      country: supplier.country || "Thailand",
      tax_id: supplier.tax_id || "",
      payment_terms: supplier.payment_terms || "",
      credit_limit: supplier.credit_limit || 0,
      rating: supplier.rating || 5,
      notes: supplier.notes || "",
      status: supplier.status,
    });
    onFormOpen();
  };

  const handleViewSupplier = (supplier: any) => {
    setSelectedSupplier(supplier);
    onDetailOpen();
  };

  const handleSaveSupplier = async () => {
    try {
      if (isEditing && selectedSupplier) {
        await updateSupplier({
          id: selectedSupplier.id,
          data: formData,
        });
        toast({
          title: "แก้ไขข้อมูลซัพพลายเออร์สำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await createSupplier(formData);
        toast({
          title: "เพิ่มซัพพลายเออร์ใหม่สำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      onFormClose();
      refetch();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "gray";
      case "suspended":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "ใช้งาน";
      case "inactive":
        return "ไม่ใช้งาน";
      case "suspended":
        return "ระงับ";
      default:
        return "ไม่ทราบ";
    }
  };

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Box mb={8}>
        <HStack justify="space-between" mb={4}>
          <Box>
            <Heading size="lg" mb={2} fontFamily="heading">
              จัดการซัพพลายเออร์
            </Heading>
            <Text color="gray.600">จัดการข้อมูลซัพพลายเออร์และคู่ค้า</Text>
          </Box>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            size="lg"
            onClick={handleAddSupplier}
          >
            เพิ่มซัพพลายเออร์ใหม่
          </Button>
        </HStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    ซัพพลายเออร์ทั้งหมด
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {statsLoading ? <Spinner size="sm" /> : stats.total}
                  </Text>
                </Box>
                <Icon as={FiUsers} boxSize={8} color="blue.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    ใช้งาน
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {statsLoading ? <Spinner size="sm" /> : stats.active}
                  </Text>
                </Box>
                <Icon as={FiCheck} boxSize={8} color="green.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    ระงับ/ไม่ใช้งาน
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="red.500">
                    {statsLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      stats.inactive + stats.suspended
                    )}
                  </Text>
                </Box>
                <Icon as={FiX} boxSize={8} color="red.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    คะแนนเฉลี่ย
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {statsLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      `${stats.avgRating}/5`
                    )}
                  </Text>
                </Box>
                <Icon as={FiStar} boxSize={8} color="yellow.500" />
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Filters */}
      <Card mb={6}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement>
                <FiSearch />
              </InputLeftElement>
              <Input
                placeholder="ค้นหาชื่อ, ผู้ติดต่อ, รหัส..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              placeholder="สถานะ"
              maxW="200px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="suspended">ระงับ</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              รายการซัพพลายเออร์ ({filteredSuppliers.length})
            </Text>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          {loading ? (
            <Flex justify="center" p={8}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ซัพพลายเออร์</Th>
                  <Th>ผู้ติดต่อ</Th>
                  <Th>ที่อยู่</Th>
                  <Th>เงื่อนไขการชำระ</Th>
                  <Th>คะแนน</Th>
                  <Th>สถานะ</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSuppliers.map((supplier) => (
                  <Tr key={supplier.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{supplier.name}</Text>
                        <Badge colorScheme="gray" variant="outline">
                          {supplier.supplier_code}
                        </Badge>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          {supplier.contact_person || "ไม่ระบุ"}
                        </Text>
                        {supplier.email && (
                          <HStack>
                            <Icon as={FiMail} boxSize={3} />
                            <Text fontSize="xs" color="gray.600">
                              {supplier.email}
                            </Text>
                          </HStack>
                        )}
                        {supplier.phone && (
                          <HStack>
                            <Icon as={FiPhone} boxSize={3} />
                            <Text fontSize="xs" color="gray.600">
                              {supplier.phone}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {supplier.city
                          ? `${supplier.city}, ${supplier.country}`
                          : supplier.country}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {supplier.payment_terms || "ไม่ระบุ"}
                      </Text>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FiStar} color="yellow.500" />
                        <Text fontSize="sm">
                          {supplier.rating || "ไม่ระบุ"}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(supplier.status)}
                        variant="solid"
                      >
                        {getStatusText(supplier.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEye />}
                            onClick={() => handleViewSupplier(supplier)}
                          >
                            ดูรายละเอียด
                          </MenuItem>
                          <MenuItem
                            icon={<FiEdit />}
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            แก้ไข
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Supplier Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            รายละเอียดซัพพลายเออร์ {selectedSupplier?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSupplier && (
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="medium">ชื่อบริษัท</Text>
                    <Text>{selectedSupplier.name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">รหัสซัพพลายเออร์</Text>
                    <Badge>{selectedSupplier.supplier_code}</Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">ผู้ติดต่อ</Text>
                    <Text>{selectedSupplier.contact_person || "ไม่ระบุ"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">อีเมล</Text>
                    <Text>{selectedSupplier.email || "ไม่ระบุ"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">เบอร์โทรศัพท์</Text>
                    <Text>{selectedSupplier.phone || "ไม่ระบุ"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">สถานะ</Text>
                    <Badge
                      colorScheme={getStatusColor(selectedSupplier.status)}
                    >
                      {getStatusText(selectedSupplier.status)}
                    </Badge>
                  </Box>
                </SimpleGrid>

                {selectedSupplier.address && (
                  <Box>
                    <Text fontWeight="medium">ที่อยู่</Text>
                    <Text>{selectedSupplier.address}</Text>
                  </Box>
                )}

                {selectedSupplier.notes && (
                  <Box>
                    <Text fontWeight="medium">หมายเหตุ</Text>
                    <Text>{selectedSupplier.notes}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailClose}>
              ปิด
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleEditSupplier(selectedSupplier!)}
            >
              แก้ไข
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add/Edit Supplier Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "แก้ไขข้อมูลซัพพลายเออร์" : "เพิ่มซัพพลายเออร์ใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>ชื่อบริษัท</FormLabel>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="ชื่อบริษัทซัพพลายเออร์"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>ผู้ติดต่อ</FormLabel>
                  <Input
                    value={formData.contact_person || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact_person: e.target.value,
                      }))
                    }
                    placeholder="ชื่อผู้ติดต่อ"
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
                    placeholder="email@company.com"
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
                    placeholder="02-123-4567"
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
                    placeholder="กรุงเทพมหานคร"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>ประเทศ</FormLabel>
                  <Input
                    value={formData.country || "Thailand"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="Thailand"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>เงื่อนไขการชำระ</FormLabel>
                  <Input
                    value={formData.payment_terms || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        payment_terms: e.target.value,
                      }))
                    }
                    placeholder="Net 30"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>คะแนน (1-5)</FormLabel>
                  <NumberInput
                    min={1}
                    max={5}
                    value={formData.rating || 5}
                    onChange={(_, value) =>
                      setFormData((prev) => ({
                        ...prev,
                        rating: value || 5,
                      }))
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

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
                  placeholder="ที่อยู่สำนักงาน"
                />
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
                  placeholder="หมายเหตุเพิ่มเติม"
                />
              </FormControl>

              <FormControl>
                <FormLabel>สถานะ</FormLabel>
                <Select
                  value={formData.status || "active"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                  <option value="suspended">ระงับ</option>
                </Select>
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
              onClick={handleSaveSupplier}
              leftIcon={<FiSave />}
              isLoading={isCreating || isUpdating}
              loadingText="กำลังบันทึก..."
            >
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

SupplierManagementPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการซัพพลายเออร์">{page}</Layout>;
};

export default withAuth(SupplierManagementPage) as NextPageWithLayout;
