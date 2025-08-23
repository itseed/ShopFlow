import React, { useState, useEffect } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../_app";
import Layout from "../../../components/Layout";
import { withAuth } from "../../../lib/auth";
import { UserProfile, UserRole } from "@shopflow/types";
import { CreateUserData, UpdateUserData } from "@shopflow/api";
import {
  useEmployees,
  useEmployeeStats,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "../../../lib/hooks/useEmployees";
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
  AlertDescription,
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
  Avatar,
  Checkbox,
  CheckboxGroup,
  Stack,
} from "@chakra-ui/react";
import {
  FiUser,
  FiUsers,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiPhone,
  FiMail,
  FiMapPin,
  FiShield,
  FiSettings,
  FiSave,
  FiEye,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import Link from "next/link";

// Using UserProfile from types package
interface EmployeeFormData {
  display_name: string;
  email: string;
  role: UserRole;
  branch_id?: string;
  is_active?: boolean;
  password?: string; // For new users
}

const userRoles: { value: UserRole; label: string; description: string }[] = [
  {
    value: "admin",
    label: "ผู้ดูแลระบบ",
    description: "เข้าถึงระบบได้ทั้งหมด",
  },
  { value: "staff", label: "พนักงาน", description: "เข้าถึงระบบตามที่กำหนด" },
];

function EmployeeSettingsPage() {
  // Real Supabase hooks
  const { employees, loading, error, refetch } = useEmployees();
  const { stats, loading: statsLoading } = useEmployeeStats();
  const { createEmployee, isCreating } = useCreateEmployee();
  const { updateEmployee, isUpdating } = useUpdateEmployee();
  const { deleteEmployee, isDeleting } = useDeleteEmployee();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [branchFilter, setBranchFilter] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    display_name: "",
    email: "",
    role: "staff",
    is_active: true,
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
  const toast = useToast();

  // Filter employees
  const filteredEmployees = (employees || []).filter((employee) => {
    const matchesSearch =
      !searchTerm ||
      employee.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || employee.role === roleFilter;
    const matchesBranch = !branchFilter || employee.branch_id === branchFilter;

    return matchesSearch && matchesRole && matchesBranch;
  });

  const handleViewEmployee = (employee: UserProfile) => {
    setSelectedEmployee(employee);
    onDetailOpen();
  };

  const handleEditEmployee = (employee: UserProfile) => {
    setSelectedEmployee(employee);
    setFormData({
      display_name: employee.display_name,
      email: employee.email || "",
      role: employee.role,
      branch_id: employee.branch_id,
      is_active: employee.is_active,
    });
    setIsEditing(true);
    onFormOpen();
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormData({
      display_name: "",
      email: "",
      role: "staff",
      is_active: true,
      password: "",
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleSaveEmployee = async () => {
    if (!formData.display_name || !formData.email) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (isEditing && selectedEmployee) {
        await updateEmployee({
          id: selectedEmployee.id,
          data: {
            display_name: formData.display_name,
            role: formData.role,
            branch_id: formData.branch_id,
            is_active: formData.is_active,
          },
        });
        toast({
          title: "แก้ไขข้อมูลพนักงานสำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        if (!formData.password) {
          toast({
            title: "กรุณากรอกรหัสผ่านสำหรับพนักงานใหม่",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        await createEmployee({
          email: formData.email,
          password: formData.password,
          display_name: formData.display_name,
          role: formData.role,
          branch_id: formData.branch_id,
          is_active: formData.is_active,
        });
        toast({
          title: "เพิ่มพนักงานใหม่สำเร็จ",
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

  const handleToggleStatus = async (employeeId: string) => {
    const employee = employees?.find((emp) => emp.id === employeeId);
    if (!employee) return;

    try {
      await updateEmployee({
        id: employeeId,
        data: {
          is_active: !employee.is_active,
        },
      });
      toast({
        title: "เปลี่ยนสถานะพนักงานสำเร็จ",
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
              จัดการพนักงาน
            </Heading>
            <Text color="gray.600">
              จัดการข้อมูลพนักงานและสิทธิ์การเข้าถึงระบบ
            </Text>
          </Box>
          <Link href="/settings/employees/new">
            <Button leftIcon={<FiPlus />} colorScheme="blue" size="lg">
              เพิ่มพนักงานใหม่
            </Button>
          </Link>
        </HStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    พนักงานทั้งหมด
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
                    พนักงานที่ปฏิบัติงาน
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {statsLoading ? <Spinner size="sm" /> : stats.active}
                  </Text>
                </Box>
                <Icon as={FiUserCheck} boxSize={8} color="green.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    พนักงานที่ลาออก
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="red.500">
                    {statsLoading ? <Spinner size="sm" /> : stats.inactive}
                  </Text>
                </Box>
                <Icon as={FiUserX} boxSize={8} color="red.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    ผู้ดูแลระบบ
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {statsLoading ? <Spinner size="sm" /> : stats.admin}
                  </Text>
                </Box>
                <Icon as={FiUser} boxSize={8} color="purple.500" />
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
                placeholder="ค้นหาชื่อ, อีเมล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              placeholder="บทบาท"
              maxW="200px"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
            >
              {userRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>

            <Select
              placeholder="สรุปการแสดง"
              maxW="200px"
              value="all"
              onChange={() => {}}
            >
              <option value="all">แสดงทั้งหมด</option>
              <option value="active">ที่ปฏิบัติงาน</option>
              <option value="inactive">ที่ลาออก</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              รายการพนักงาน ({filteredEmployees.length})
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
                  <Th>พนักงาน</Th>
                  <Th>บทบาท</Th>
                  <Th>สาขา</Th>
                  <Th>ติดต่อ</Th>
                  <Th>สถานะ</Th>
                  <Th>วันที่สร้าง</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredEmployees.map((employee) => (
                  <Tr key={employee.id}>
                    <Td>
                      <HStack>
                        <Avatar size="md" name={employee.display_name} />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold">
                            {employee.display_name}
                          </Text>
                          <Badge colorScheme="gray" variant="outline">
                            {employee.id.slice(0, 8)}
                          </Badge>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={employee.role === "admin" ? "red" : "blue"}
                        variant="solid"
                      >
                        {employee.role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {employee.branch?.name || "ไม่ระบุ"}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        <Icon as={FiMail} mr={1} />
                        {(employee as any).email || "ไม่ระบุ"}
                      </Text>
                    </Td>
                    <Td>
                      <Switch
                        isChecked={employee.is_active}
                        onChange={() => handleToggleStatus(employee.id)}
                        colorScheme="green"
                        size="md"
                        isDisabled={isUpdating}
                      />
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(employee.created_at || "").toLocaleDateString(
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
                            icon={<FiEye />}
                            onClick={() => handleViewEmployee(employee)}
                          >
                            ดูรายละเอียด
                          </MenuItem>
                          <MenuItem
                            icon={<FiEdit />}
                            onClick={() => handleEditEmployee(employee)}
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

      {/* Employee Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            รายละเอียดพนักงาน {selectedEmployee?.display_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEmployee && (
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="medium">ชื่อผู้ใช้</Text>
                    <Text>{selectedEmployee.display_name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">ID</Text>
                    <Badge>{selectedEmployee.id.slice(0, 8)}</Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">อีเมล</Text>
                    <Text>{selectedEmployee.email || "ไม่ระบุ"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">บทบาท</Text>
                    <Badge
                      colorScheme={
                        selectedEmployee.role === "admin" ? "red" : "blue"
                      }
                      variant="solid"
                    >
                      {selectedEmployee.role === "admin"
                        ? "ผู้ดูแลระบบ"
                        : "พนักงาน"}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">สาขา</Text>
                    <Text>{selectedEmployee.branch?.name || "ไม่ระบุ"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">สถานะ</Text>
                    <Badge
                      colorScheme={selectedEmployee.is_active ? "green" : "red"}
                    >
                      {selectedEmployee.is_active ? "ปฏิบัติงาน" : "ลาออก"}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">วันที่สร้าง</Text>
                    <Text>
                      {new Date(
                        selectedEmployee.created_at || ""
                      ).toLocaleDateString("th-TH")}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">วันที่อัปเดตล่าสุด</Text>
                    <Text>
                      {new Date(
                        selectedEmployee.updated_at || ""
                      ).toLocaleDateString("th-TH")}
                    </Text>
                  </Box>
                </SimpleGrid>

                {(selectedEmployee.branch as any)?.address && (
                  <Box>
                    <Text fontWeight="medium">ที่อยู่สาขา</Text>
                    <Text>{(selectedEmployee.branch as any).address}</Text>
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
              onClick={() => handleEditEmployee(selectedEmployee!)}
            >
              แก้ไข
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add/Edit Employee Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>ชื่อผู้ใช้</FormLabel>
                  <Input
                    value={formData.display_name || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        display_name: e.target.value,
                      }))
                    }
                    placeholder="ชื่อและนามสกุล"
                  />
                </FormControl>

                <FormControl isRequired>
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
                    isDisabled={isEditing} // Cannot change email after creation
                  />
                  {isEditing && (
                    <FormHelperText>
                      ไม่สามารถเปลี่ยนอีเมลหลังจากสร้างบัญชีแล้ว
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>บทบาท</FormLabel>
                  <Select
                    value={formData.role || "staff"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: e.target.value as UserRole,
                      }))
                    }
                  >
                    {userRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText>
                    {formData.role === "admin"
                      ? "ผู้ดูแลระบบสามารถเข้าถึงระบบได้ทั้งหมด"
                      : "พนักงานทั่วไปมีสิทธิ์จำกัด"}
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>สาขา</FormLabel>
                  <Select
                    value={formData.branch_id || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        branch_id: e.target.value || undefined,
                      }))
                    }
                    placeholder="เลือกสาขา"
                  >
                    <option value="">ไม่ระบุสาขา</option>
                    {/* Add branch options here if needed */}
                  </Select>
                </FormControl>
              </SimpleGrid>

              {!isEditing && (
                <FormControl isRequired>
                  <FormLabel>รหัสผ่าน</FormLabel>
                  <Input
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="รหัสผ่านสำหรับพนักงานใหม่"
                  />
                  <FormHelperText>
                    รหัสผ่านควรมีความปลอดภัยอย่างน้อย 8 ตัวอักษร
                  </FormHelperText>
                </FormControl>
              )}

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={formData.is_active !== false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    colorScheme="green"
                  />
                  <Text>สถานะการทำงาน (เปิด/ปิด)</Text>
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
              onClick={handleSaveEmployee}
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
}

EmployeeSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการพนักงาน">{page}</Layout>;
};

export default withAuth(EmployeeSettingsPage) as NextPageWithLayout;
