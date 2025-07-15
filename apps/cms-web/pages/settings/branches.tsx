import React, { useState, useEffect } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useDisclosure,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  Switch,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import {
  FiMapPin,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiPhone,
  FiMail,
  FiClock,
  FiUser,
  FiSettings,
  FiSave,
  FiX,
} from "react-icons/fi";

// Branch interface
interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email?: string;
  manager_name: string;
  manager_phone: string;
  is_active: boolean;
  opening_hours: {
    monday: { open: string; close: string; is_open: boolean };
    tuesday: { open: string; close: string; is_open: boolean };
    wednesday: { open: string; close: string; is_open: boolean };
    thursday: { open: string; close: string; is_open: boolean };
    friday: { open: string; close: string; is_open: boolean };
    saturday: { open: string; close: string; is_open: boolean };
    sunday: { open: string; close: string; is_open: boolean };
  };
  created_at?: string;
  updated_at?: string;
}

// Mock data for branches
const mockBranches: Branch[] = [
  {
    id: "BR-001",
    name: "สำนักงานใหญ่",
    code: "HQ",
    address: "123 ถ.สุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110",
    phone: "02-123-4567",
    email: "hq@shopflow.com",
    manager_name: "นายสมชาย ผู้จัดการ",
    manager_phone: "081-234-5678",
    is_active: true,
    opening_hours: {
      monday: { open: "08:00", close: "18:00", is_open: true },
      tuesday: { open: "08:00", close: "18:00", is_open: true },
      wednesday: { open: "08:00", close: "18:00", is_open: true },
      thursday: { open: "08:00", close: "18:00", is_open: true },
      friday: { open: "08:00", close: "18:00", is_open: true },
      saturday: { open: "09:00", close: "17:00", is_open: true },
      sunday: { open: "09:00", close: "17:00", is_open: false },
    },
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "BR-002",
    name: "สาขาลาดพร้าว",
    code: "LDP",
    address: "456 ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900",
    phone: "02-234-5678",
    email: "ladprao@shopflow.com",
    manager_name: "นางสาวสมหญิง ผู้จัดการ",
    manager_phone: "082-345-6789",
    is_active: true,
    opening_hours: {
      monday: { open: "08:00", close: "20:00", is_open: true },
      tuesday: { open: "08:00", close: "20:00", is_open: true },
      wednesday: { open: "08:00", close: "20:00", is_open: true },
      thursday: { open: "08:00", close: "20:00", is_open: true },
      friday: { open: "08:00", close: "20:00", is_open: true },
      saturday: { open: "09:00", close: "21:00", is_open: true },
      sunday: { open: "09:00", close: "21:00", is_open: true },
    },
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "BR-003",
    name: "สาขารามอินทรา",
    code: "RIM",
    address: "789 ถ.รามอินทรา แขวงคันนายาว เขตคันนายาว กรุงเทพฯ 10230",
    phone: "02-345-6789",
    manager_name: "นายประยุทธ ผู้จัดการ",
    manager_phone: "083-456-7890",
    is_active: false,
    opening_hours: {
      monday: { open: "08:00", close: "18:00", is_open: true },
      tuesday: { open: "08:00", close: "18:00", is_open: true },
      wednesday: { open: "08:00", close: "18:00", is_open: true },
      thursday: { open: "08:00", close: "18:00", is_open: true },
      friday: { open: "08:00", close: "18:00", is_open: true },
      saturday: { open: "09:00", close: "17:00", is_open: true },
      sunday: { open: "09:00", close: "17:00", is_open: false },
    },
    created_at: "2024-03-01T00:00:00Z",
  },
];

const dayNames = {
  monday: "จันทร์",
  tuesday: "อังคาร",
  wednesday: "พุธ",
  thursday: "พฤหัสบดี",
  friday: "ศุกร์",
  saturday: "เสาร์",
  sunday: "อาทิตย์",
};

function BranchSettingsPage() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Branch>>({});

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
  const toast = useToast();

  // Filter branches
  const filteredBranches = branches.filter(
    (branch) =>
      !searchTerm ||
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    onDetailOpen();
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData(branch);
    setIsEditing(true);
    onFormOpen();
  };

  const handleAddBranch = () => {
    setSelectedBranch(null);
    setFormData({
      name: "",
      code: "",
      address: "",
      phone: "",
      email: "",
      manager_name: "",
      manager_phone: "",
      is_active: true,
      opening_hours: {
        monday: { open: "08:00", close: "18:00", is_open: true },
        tuesday: { open: "08:00", close: "18:00", is_open: true },
        wednesday: { open: "08:00", close: "18:00", is_open: true },
        thursday: { open: "08:00", close: "18:00", is_open: true },
        friday: { open: "08:00", close: "18:00", is_open: true },
        saturday: { open: "09:00", close: "17:00", is_open: true },
        sunday: { open: "09:00", close: "17:00", is_open: false },
      },
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleSaveBranch = () => {
    if (!formData.name || !formData.code || !formData.address) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isEditing && selectedBranch) {
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === selectedBranch.id ? { ...branch, ...formData } : branch
        )
      );
      toast({
        title: "แก้ไขสาขาสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      const newBranch: Branch = {
        ...(formData as Branch),
        id: `BR-${String(branches.length + 1).padStart(3, "0")}`,
        created_at: new Date().toISOString(),
      };
      setBranches((prev) => [...prev, newBranch]);
      toast({
        title: "เพิ่มสาขาใหม่สำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    onFormClose();
  };

  const handleToggleStatus = (branchId: string) => {
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === branchId
          ? { ...branch, is_active: !branch.is_active }
          : branch
      )
    );

    toast({
      title: "เปลี่ยนสถานะสาขาสำเร็จ",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const updateOpeningHours = (
    day: keyof typeof dayNames,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours!,
        [day]: {
          ...prev.opening_hours![day],
          [field]: value,
        },
      },
    }));
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <HStack justify="space-between" mb={4}>
          <Box>
            <Heading size="lg" mb={2} fontFamily="heading">
              จัดการสาขา
            </Heading>
            <Text color="gray.600">จัดการข้อมูลสาขาต่างๆ ของบริษัท</Text>
          </Box>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            size="lg"
            onClick={handleAddBranch}
          >
            เพิ่มสาขาใหม่
          </Button>
        </HStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    สาขาทั้งหมด
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {branches.length}
                  </Text>
                </Box>
                <Icon as={FiMapPin} boxSize={8} color="blue.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    สาขาที่เปิดให้บริการ
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {branches.filter((b) => b.is_active).length}
                  </Text>
                </Box>
                <Icon as={FiClock} boxSize={8} color="green.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    สาขาที่ปิดชั่วคราว
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="red.500">
                    {branches.filter((b) => !b.is_active).length}
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
                    ผู้จัดการสาขา
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {new Set(branches.map((b) => b.manager_name)).size}
                  </Text>
                </Box>
                <Icon as={FiUser} boxSize={8} color="purple.500" />
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Search */}
      <Card mb={6}>
        <CardBody>
          <InputGroup maxW="400px">
            <InputLeftElement>
              <FiSearch />
            </InputLeftElement>
            <Input
              placeholder="ค้นหาชื่อสาขา, รหัส, หรือที่อยู่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </CardBody>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              รายการสาขา ({filteredBranches.length})
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
                  <Th>รหัส/ชื่อสาขา</Th>
                  <Th>ที่อยู่</Th>
                  <Th>ผู้จัดการ</Th>
                  <Th>ติดต่อ</Th>
                  <Th>สถานะ</Th>
                  <Th>วันที่สร้าง</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredBranches.map((branch) => (
                  <Tr key={branch.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{branch.name}</Text>
                        <Badge colorScheme="gray" variant="outline">
                          {branch.code}
                        </Badge>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm" noOfLines={2}>
                        {branch.address}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {branch.manager_name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          <Icon as={FiPhone} mr={1} />
                          {branch.manager_phone}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs">
                          <Icon as={FiPhone} mr={1} />
                          {branch.phone}
                        </Text>
                        {branch.email && (
                          <Text fontSize="xs">
                            <Icon as={FiMail} mr={1} />
                            {branch.email}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Switch
                        isChecked={branch.is_active}
                        onChange={() => handleToggleStatus(branch.id)}
                        colorScheme="green"
                        size="md"
                      />
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(branch.created_at!).toLocaleDateString(
                          "th-TH"
                        )}
                      </Text>
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
                            icon={<FiMapPin />}
                            onClick={() => handleViewBranch(branch)}
                          >
                            ดูรายละเอียด
                          </MenuItem>
                          <MenuItem
                            icon={<FiEdit />}
                            onClick={() => handleEditBranch(branch)}
                          >
                            แก้ไข
                          </MenuItem>
                          <MenuItem icon={<FiSettings />}>
                            ตั้งค่าขั้นสูง
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

      {/* Branch Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>รายละเอียดสาขา {selectedBranch?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedBranch && (
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="medium">ชื่อสาขา</Text>
                    <Text>{selectedBranch.name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">รหัสสาขา</Text>
                    <Badge>{selectedBranch.code}</Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">ที่อยู่</Text>
                    <Text>{selectedBranch.address}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">เบอร์โทร</Text>
                    <Text>{selectedBranch.phone}</Text>
                  </Box>
                  {selectedBranch.email && (
                    <Box>
                      <Text fontWeight="medium">อีเมล</Text>
                      <Text>{selectedBranch.email}</Text>
                    </Box>
                  )}
                  <Box>
                    <Text fontWeight="medium">ผู้จัดการ</Text>
                    <Text>{selectedBranch.manager_name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">เบอร์ผู้จัดการ</Text>
                    <Text>{selectedBranch.manager_phone}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">สถานะ</Text>
                    <Badge
                      colorScheme={selectedBranch.is_active ? "green" : "red"}
                    >
                      {selectedBranch.is_active
                        ? "เปิดให้บริการ"
                        : "ปิดชั่วคราว"}
                    </Badge>
                  </Box>
                </SimpleGrid>

                {/* Opening Hours */}
                <Box>
                  <Text fontWeight="medium" mb={4}>
                    เวลาทำการ
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {Object.entries(selectedBranch.opening_hours).map(
                      ([day, hours]) => (
                        <HStack key={day} justify="space-between">
                          <Text minW="100px">
                            {dayNames[day as keyof typeof dayNames]}
                          </Text>
                          {hours.is_open ? (
                            <Text color="green.600">
                              {hours.open} - {hours.close}
                            </Text>
                          ) : (
                            <Text color="red.500">ปิด</Text>
                          )}
                        </HStack>
                      )
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailClose}>
              ปิด
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleEditBranch(selectedBranch!)}
            >
              แก้ไข
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add/Edit Branch Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "แก้ไขข้อมูลสาขา" : "เพิ่มสาขาใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>ชื่อสาขา</FormLabel>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="ชื่อสาขา"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>รหัสสาขา</FormLabel>
                  <Input
                    value={formData.code || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="เช่น HQ, BKK, CNX"
                  />
                  <FormHelperText>
                    รหัสสำหรับระบุสาขา (ภาษาอังกฤษ)
                  </FormHelperText>
                </FormControl>

                <FormControl isRequired gridColumn="span 2">
                  <FormLabel>ที่อยู่</FormLabel>
                  <Textarea
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="ที่อยู่ของสาขา"
                    rows={3}
                  />
                </FormControl>

                <FormControl isRequired>
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
                    placeholder="branch@company.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>ชื่อผู้จัดการ</FormLabel>
                  <Input
                    value={formData.manager_name || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        manager_name: e.target.value,
                      }))
                    }
                    placeholder="ชื่อผู้จัดการสาขา"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>เบอร์โทรผู้จัดการ</FormLabel>
                  <Input
                    value={formData.manager_phone || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        manager_phone: e.target.value,
                      }))
                    }
                    placeholder="081-234-5678"
                  />
                </FormControl>
              </SimpleGrid>

              {/* Opening Hours */}
              <Box>
                <Text fontWeight="medium" mb={4}>
                  เวลาทำการ
                </Text>
                <VStack spacing={3} align="stretch">
                  {Object.entries(formData.opening_hours || {}).map(
                    ([day, hours]) => (
                      <HStack key={day} spacing={4}>
                        <Text minW="80px" fontSize="sm">
                          {dayNames[day as keyof typeof dayNames]}
                        </Text>
                        <Switch
                          isChecked={hours.is_open}
                          onChange={(e) =>
                            updateOpeningHours(
                              day as keyof typeof dayNames,
                              "is_open",
                              e.target.checked
                            )
                          }
                          colorScheme="green"
                        />
                        {hours.is_open && (
                          <HStack spacing={2}>
                            <Input
                              type="time"
                              size="sm"
                              width="120px"
                              value={hours.open}
                              onChange={(e) =>
                                updateOpeningHours(
                                  day as keyof typeof dayNames,
                                  "open",
                                  e.target.value
                                )
                              }
                            />
                            <Text fontSize="sm">ถึง</Text>
                            <Input
                              type="time"
                              size="sm"
                              width="120px"
                              value={hours.close}
                              onChange={(e) =>
                                updateOpeningHours(
                                  day as keyof typeof dayNames,
                                  "close",
                                  e.target.value
                                )
                              }
                            />
                          </HStack>
                        )}
                      </HStack>
                    )
                  )}
                </VStack>
              </Box>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    colorScheme="green"
                  />
                  <Text>เปิดให้บริการ</Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFormClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveBranch}
              leftIcon={<FiSave />}
            >
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

BranchSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการสาขา">{page}</Layout>;
};

export default withAuth(BranchSettingsPage) as NextPageWithLayout;
