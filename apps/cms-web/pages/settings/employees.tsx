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

// Employee interface
interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  branch_id?: string;
  branch_name?: string;
  hire_date: string;
  salary: number;
  is_active: boolean;
  permissions: string[];
  manager_id?: string;
  manager_name?: string;
  address?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Mock data for employees
const mockEmployees: Employee[] = [
  {
    id: "EMP-001",
    employee_code: "E001",
    first_name: "สมชาย",
    last_name: "ผู้จัดการ",
    email: "somchai@shopflow.com",
    phone: "081-234-5678",
    position: "ผู้จัดการทั่วไป",
    department: "บริหาร",
    branch_id: "BR-001",
    branch_name: "สำนักงานใหญ่",
    hire_date: "2023-01-01",
    salary: 50000,
    is_active: true,
    permissions: ["all"],
    address: "123 ถ.สุขุมวิท กรุงเทพฯ",
    emergency_contact: {
      name: "นางสมใจ ผู้จัดการ",
      relationship: "คู่สมรส",
      phone: "081-234-5679",
    },
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "EMP-002",
    employee_code: "E002",
    first_name: "สมหญิง",
    last_name: "พนักงานขาย",
    email: "somying@shopflow.com",
    phone: "082-345-6789",
    position: "พนักงานขาย",
    department: "ขาย",
    branch_id: "BR-001",
    branch_name: "สำนักงานใหญ่",
    hire_date: "2023-03-15",
    salary: 25000,
    is_active: true,
    permissions: ["orders", "customers", "products"],
    manager_id: "EMP-001",
    manager_name: "สมชาย ผู้จัดการ",
    address: "456 ถ.ลาดพร้าว กรุงเทพฯ",
    emergency_contact: {
      name: "นายสมศักดิ์ พนักงานขาย",
      relationship: "พี่ชาย",
      phone: "082-345-6780",
    },
    created_at: "2023-03-15T00:00:00Z",
  },
  {
    id: "EMP-003",
    employee_code: "E003",
    first_name: "ประยุทธ",
    last_name: "ผู้ช่วยผู้จัดการ",
    email: "prayuth@shopflow.com",
    phone: "083-456-7890",
    position: "ผู้ช่วยผู้จัดการ",
    department: "บริหาร",
    branch_id: "BR-002",
    branch_name: "สาขาลาดพร้าว",
    hire_date: "2023-06-01",
    salary: 35000,
    is_active: true,
    permissions: ["orders", "customers", "products", "reports"],
    manager_id: "EMP-001",
    manager_name: "สมชาย ผู้จัดการ",
    address: "789 ถ.รามอินทรา กรุงเทพฯ",
    created_at: "2023-06-01T00:00:00Z",
  },
  {
    id: "EMP-004",
    employee_code: "E004",
    first_name: "มานะ",
    last_name: "พนักงานคลัง",
    email: "mana@shopflow.com",
    phone: "084-567-8901",
    position: "พนักงานคลัง",
    department: "คลังสินค้า",
    branch_id: "BR-001",
    branch_name: "สำนักงานใหญ่",
    hire_date: "2023-09-15",
    salary: 20000,
    is_active: false,
    permissions: ["products", "inventory"],
    manager_id: "EMP-001",
    manager_name: "สมชาย ผู้จัดการ",
    created_at: "2023-09-15T00:00:00Z",
  },
];

const positions = [
  "ผู้จัดการทั่วไป",
  "ผู้ช่วยผู้จัดการ",
  "หัวหน้าแผนก",
  "พนักงานขาย",
  "พนักงานคลัง",
  "พนักงานบัญชี",
  "พนักงานการตลาด",
  "เจ้าหน้าที่ IT",
  "พนักงานทั่วไป",
];

const departments = [
  "บริหาร",
  "ขาย",
  "คลังสินค้า",
  "บัญชี",
  "การตลาด",
  "เทคโนโลยี",
  "ทรัพยากรมนุษย์",
];

const allPermissions = [
  { id: "all", label: "สิทธิ์ทั้งหมด", description: "เข้าถึงระบบได้ทั้งหมด" },
  { id: "dashboard", label: "แดชบอร์ด", description: "ดูหน้าแดชบอร์ด" },
  {
    id: "products",
    label: "จัดการสินค้า",
    description: "เพิ่ม แก้ไข ลบสินค้า",
  },
  {
    id: "categories",
    label: "จัดการหมวดหมู่",
    description: "จัดการหมวดหมู่สินค้า",
  },
  {
    id: "orders",
    label: "จัดการคำสั่งซื้อ",
    description: "ดู แก้ไข สถานะคำสั่งซื้อ",
  },
  { id: "customers", label: "จัดการลูกค้า", description: "ดูข้อมูลลูกค้า" },
  {
    id: "inventory",
    label: "จัดการสต๊อก",
    description: "ดูและแก้ไขสต๊อกสินค้า",
  },
  { id: "reports", label: "รายงาน", description: "ดูรายงานต่างๆ" },
  { id: "settings", label: "ตั้งค่าระบบ", description: "แก้ไขการตั้งค่า" },
  { id: "users", label: "จัดการผู้ใช้", description: "จัดการพนักงานและสิทธิ์" },
];

function EmployeeSettingsPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({});

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
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      !searchTerm ||
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      !departmentFilter || employee.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    onDetailOpen();
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      ...employee,
      emergency_contact: employee.emergency_contact || {
        name: "",
        relationship: "",
        phone: "",
      },
    });
    setIsEditing(true);
    onFormOpen();
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      hire_date: new Date().toISOString().split("T")[0],
      salary: 0,
      is_active: true,
      permissions: [],
      emergency_contact: { name: "", relationship: "", phone: "" },
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleSaveEmployee = () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.position
    ) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isEditing && selectedEmployee) {
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === selectedEmployee.id
            ? { ...employee, ...formData }
            : employee
        )
      );
      toast({
        title: "แก้ไขข้อมูลพนักงานสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      const { id, employee_code, ...formDataWithoutId } = formData as Employee;
      const newEmployee: Employee = {
        id: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
        employee_code: `E${String(employees.length + 1).padStart(3, "0")}`,
        ...formDataWithoutId,
        created_at: new Date().toISOString(),
      };
      setEmployees((prev) => [...prev, newEmployee]);
      toast({
        title: "เพิ่มพนักงานใหม่สำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    onFormClose();
  };

  const handleToggleStatus = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === employeeId
          ? { ...employee, is_active: !employee.is_active }
          : employee
      )
    );

    toast({
      title: "เปลี่ยนสถานะพนักงานสำเร็จ",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
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
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            size="lg"
            onClick={handleAddEmployee}
          >
            เพิ่มพนักงานใหม่
          </Button>
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
                    {employees.length}
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
                    {employees.filter((e) => e.is_active).length}
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
                    {employees.filter((e) => !e.is_active).length}
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
                    แผนกทั้งหมด
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {new Set(employees.map((e) => e.department)).size}
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
                placeholder="ค้นหาชื่อ, รหัส, อีเมล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              placeholder="แผนก"
              maxW="200px"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
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
                  <Th>ตำแหน่ง/แผนก</Th>
                  <Th>สาขา</Th>
                  <Th>ติดต่อ</Th>
                  <Th>สิทธิ์</Th>
                  <Th>สถานะ</Th>
                  <Th>วันที่เริ่มงาน</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredEmployees.map((employee) => (
                  <Tr key={employee.id}>
                    <Td>
                      <HStack>
                        <Avatar
                          size="md"
                          name={`${employee.first_name} ${employee.last_name}`}
                        />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold">
                            {employee.first_name} {employee.last_name}
                          </Text>
                          <Badge colorScheme="gray" variant="outline">
                            {employee.employee_code}
                          </Badge>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {employee.position}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {employee.department}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {employee.branch_name || "ไม่ระบุ"}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs">
                          <Icon as={FiPhone} mr={1} />
                          {employee.phone}
                        </Text>
                        <Text fontSize="xs">
                          <Icon as={FiMail} mr={1} />
                          {employee.email}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={1} wrap="wrap">
                        {employee.permissions.includes("all") ? (
                          <Badge colorScheme="red" variant="solid">
                            Admin
                          </Badge>
                        ) : (
                          <>
                            {employee.permissions
                              .slice(0, 2)
                              .map((permission) => (
                                <Badge
                                  key={permission}
                                  colorScheme="blue"
                                  variant="outline"
                                  size="sm"
                                >
                                  {allPermissions.find(
                                    (p) => p.id === permission
                                  )?.label || permission}
                                </Badge>
                              ))}
                            {employee.permissions.length > 2 && (
                              <Badge
                                colorScheme="gray"
                                variant="outline"
                                size="sm"
                              >
                                +{employee.permissions.length - 2}
                              </Badge>
                            )}
                          </>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Switch
                        isChecked={employee.is_active}
                        onChange={() => handleToggleStatus(employee.id)}
                        colorScheme="green"
                        size="md"
                      />
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(employee.hire_date).toLocaleDateString(
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
                          <MenuItem icon={<FiShield />}>จัดการสิทธิ์</MenuItem>
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
            รายละเอียดพนักงาน {selectedEmployee?.first_name}{" "}
            {selectedEmployee?.last_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEmployee && (
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="medium">ชื่อ</Text>
                    <Text>
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">รหัสพนักงาน</Text>
                    <Badge>{selectedEmployee.employee_code}</Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">อีเมล</Text>
                    <Text>{selectedEmployee.email}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">เบอร์โทร</Text>
                    <Text>{selectedEmployee.phone}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">ตำแหน่ง</Text>
                    <Text>{selectedEmployee.position}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">แผนก</Text>
                    <Text>{selectedEmployee.department}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">สาขา</Text>
                    <Text>{selectedEmployee.branch_name || "ไม่ระบุ"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">เงินเดือน</Text>
                    <Text>฿{selectedEmployee.salary.toLocaleString()}</Text>
                  </Box>
                  {selectedEmployee.manager_name && (
                    <Box>
                      <Text fontWeight="medium">ผู้บังคับบัญชา</Text>
                      <Text>{selectedEmployee.manager_name}</Text>
                    </Box>
                  )}
                  <Box>
                    <Text fontWeight="medium">วันที่เริ่มงาน</Text>
                    <Text>
                      {new Date(selectedEmployee.hire_date).toLocaleDateString(
                        "th-TH"
                      )}
                    </Text>
                  </Box>
                </SimpleGrid>

                {selectedEmployee.address && (
                  <Box>
                    <Text fontWeight="medium">ที่อยู่</Text>
                    <Text>{selectedEmployee.address}</Text>
                  </Box>
                )}

                {selectedEmployee.emergency_contact && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      ผู้ติดต่อฉุกเฉิน
                    </Text>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm">
                        <strong>ชื่อ:</strong>{" "}
                        {selectedEmployee.emergency_contact.name}
                      </Text>
                      <Text fontSize="sm">
                        <strong>ความสัมพันธ์:</strong>{" "}
                        {selectedEmployee.emergency_contact.relationship}
                      </Text>
                      <Text fontSize="sm">
                        <strong>เบอร์โทร:</strong>{" "}
                        {selectedEmployee.emergency_contact.phone}
                      </Text>
                    </VStack>
                  </Box>
                )}

                <Box>
                  <Text fontWeight="medium" mb={2}>
                    สิทธิ์การเข้าถึง
                  </Text>
                  <HStack spacing={2} wrap="wrap">
                    {selectedEmployee.permissions.includes("all") ? (
                      <Badge colorScheme="red" variant="solid">
                        สิทธิ์ผู้ดูแลระบบ (ทั้งหมด)
                      </Badge>
                    ) : (
                      selectedEmployee.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          colorScheme="blue"
                          variant="outline"
                        >
                          {allPermissions.find((p) => p.id === permission)
                            ?.label || permission}
                        </Badge>
                      ))
                    )}
                  </HStack>
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
              onClick={() => handleEditEmployee(selectedEmployee!)}
            >
              แก้ไข
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add/Edit Employee Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="6xl">
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
                  <FormLabel>ชื่อ</FormLabel>
                  <Input
                    value={formData.first_name || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    placeholder="ชื่อ"
                  />
                </FormControl>

                <FormControl isRequired>
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
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>เบอร์โทร</FormLabel>
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

                <FormControl isRequired>
                  <FormLabel>ตำแหน่ง</FormLabel>
                  <Select
                    value={formData.position || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    placeholder="เลือกตำแหน่ง"
                  >
                    {positions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>แผนก</FormLabel>
                  <Select
                    value={formData.department || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    placeholder="เลือกแผนก"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>วันที่เริ่มงาน</FormLabel>
                  <Input
                    type="date"
                    value={formData.hire_date || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hire_date: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>เงินเดือน</FormLabel>
                  <Input
                    type="number"
                    value={formData.salary || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        salary: Number(e.target.value),
                      }))
                    }
                    placeholder="25000"
                  />
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
                  placeholder="ที่อยู่ของพนักงาน"
                  rows={3}
                />
              </FormControl>

              {/* Emergency Contact */}
              <Box>
                <Text fontWeight="medium" mb={4}>
                  ผู้ติดต่อฉุกเฉิน
                </Text>
                <SimpleGrid columns={3} spacing={4}>
                  <FormControl>
                    <FormLabel>ชื่อ</FormLabel>
                    <Input
                      value={formData.emergency_contact?.name || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emergency_contact: {
                            ...prev.emergency_contact!,
                            name: e.target.value,
                          },
                        }))
                      }
                      placeholder="ชื่อผู้ติดต่อ"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>ความสัมพันธ์</FormLabel>
                    <Input
                      value={formData.emergency_contact?.relationship || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emergency_contact: {
                            ...prev.emergency_contact!,
                            relationship: e.target.value,
                          },
                        }))
                      }
                      placeholder="เช่น คู่สมรส, พ่อ, แม่"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>เบอร์โทร</FormLabel>
                    <Input
                      value={formData.emergency_contact?.phone || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emergency_contact: {
                            ...prev.emergency_contact!,
                            phone: e.target.value,
                          },
                        }))
                      }
                      placeholder="081-234-5678"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Permissions */}
              <Box>
                <Text fontWeight="medium" mb={4}>
                  สิทธิ์การเข้าถึงระบบ
                </Text>
                <CheckboxGroup
                  value={formData.permissions || []}
                  onChange={(values) =>
                    setFormData((prev) => ({
                      ...prev,
                      permissions: values as string[],
                    }))
                  }
                >
                  <SimpleGrid columns={2} spacing={4}>
                    {allPermissions.map((permission) => (
                      <Checkbox key={permission.id} value={permission.id}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {permission.label}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {permission.description}
                          </Text>
                        </VStack>
                      </Checkbox>
                    ))}
                  </SimpleGrid>
                </CheckboxGroup>
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
                  <Text>สถานะการทำงาน (เปิด/ปิด)</Text>
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
              onClick={handleSaveEmployee}
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

EmployeeSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการพนักงาน">{page}</Layout>;
};

export default withAuth(EmployeeSettingsPage) as NextPageWithLayout;
