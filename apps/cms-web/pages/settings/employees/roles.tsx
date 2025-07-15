import React, { useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../_app";
import Layout from "../../../components/Layout";
import { withAuth } from "../../../lib/auth";
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
  FormControl,
  FormLabel,
  useToast,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Textarea,
  Switch,
  Divider,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiShield,
  FiUsers,
  FiSettings,
  FiSearch,
  FiEye,
  FiLock,
  FiUserCheck,
} from "react-icons/fi";
import Link from "next/link";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  employee_count: number;
  is_system: boolean;
  created_at: string;
}

const allPermissions = [
  { value: "products.view", label: "ดูข้อมูลสินค้า", category: "สินค้า" },
  { value: "products.create", label: "เพิ่มสินค้าใหม่", category: "สินค้า" },
  { value: "products.edit", label: "แก้ไขสินค้า", category: "สินค้า" },
  { value: "products.delete", label: "ลบสินค้า", category: "สินค้า" },
  { value: "orders.view", label: "ดูคำสั่งซื้อ", category: "คำสั่งซื้อ" },
  { value: "orders.create", label: "สร้างคำสั่งซื้อ", category: "คำสั่งซื้อ" },
  { value: "orders.edit", label: "แก้ไขคำสั่งซื้อ", category: "คำสั่งซื้อ" },
  { value: "orders.cancel", label: "ยกเลิกคำสั่งซื้อ", category: "คำสั่งซื้อ" },
  { value: "customers.view", label: "ดูข้อมูลลูกค้า", category: "ลูกค้า" },
  { value: "customers.create", label: "เพิ่มลูกค้าใหม่", category: "ลูกค้า" },
  { value: "customers.edit", label: "แก้ไขข้อมูลลูกค้า", category: "ลูกค้า" },
  { value: "customers.delete", label: "ลบลูกค้า", category: "ลูกค้า" },
  { value: "reports.view", label: "ดูรายงาน", category: "รายงาน" },
  { value: "reports.export", label: "ส่งออกรายงาน", category: "รายงาน" },
  { value: "settings.view", label: "ดูการตั้งค่า", category: "การตั้งค่า" },
  { value: "settings.edit", label: "แก้ไขการตั้งค่า", category: "การตั้งค่า" },
  { value: "employees.view", label: "ดูข้อมูลพนักงาน", category: "พนักงาน" },
  { value: "employees.create", label: "เพิ่มพนักงานใหม่", category: "พนักงาน" },
  { value: "employees.edit", label: "แก้ไขข้อมูลพนักงาน", category: "พนักงาน" },
  { value: "employees.delete", label: "ลบพนักงาน", category: "พนักงาน" },
];

const mockRoles: Role[] = [
  {
    id: "1",
    name: "ผู้ดูแลระบบ",
    description:
      "สิทธิ์เต็มในการใช้งานระบบทั้งหมด รวมถึงการจัดการพนักงานและการตั้งค่า",
    permissions: allPermissions.map((p) => p.value),
    employee_count: 2,
    is_system: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "ผู้จัดการ",
    description: "จัดการข้อมูลสินค้า คำสั่งซื้อ ลูกค้า และดูรายงาน",
    permissions: [
      "products.view",
      "products.create",
      "products.edit",
      "orders.view",
      "orders.create",
      "orders.edit",
      "customers.view",
      "customers.create",
      "customers.edit",
      "reports.view",
      "reports.export",
    ],
    employee_count: 5,
    is_system: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "หัวหน้างาน",
    description: "ดูแลงานในฝ่าย จัดการข้อมูลสินค้าและคำสั่งซื้อ",
    permissions: [
      "products.view",
      "products.edit",
      "orders.view",
      "orders.edit",
      "customers.view",
      "customers.edit",
      "reports.view",
    ],
    employee_count: 8,
    is_system: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "พนักงานขาย",
    description: "จัดการคำสั่งซื้อและข้อมูลลูกค้า",
    permissions: [
      "products.view",
      "orders.view",
      "orders.create",
      "orders.edit",
      "customers.view",
      "customers.create",
      "customers.edit",
    ],
    employee_count: 15,
    is_system: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name: "ผู้ดูข้อมูล",
    description: "ดูข้อมูลในระบบเท่านั้น ไม่สามารถแก้ไขได้",
    permissions: [
      "products.view",
      "orders.view",
      "customers.view",
      "reports.view",
    ],
    employee_count: 3,
    is_system: true,
    created_at: "2024-01-01T00:00:00Z",
  },
];

function RolesPage() {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRole = () => {
    setSelectedRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setIsEditing(false);
    onOpen();
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    onDeleteOpen();
  };

  const handleSaveRole = () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isEditing && selectedRole) {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === selectedRole.id ? { ...role, ...formData } : role
        )
      );
      toast({
        title: "แก้ไขบทบาทสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        ...formData,
        employee_count: 0,
        is_system: false,
        created_at: new Date().toISOString(),
      };
      setRoles((prev) => [...prev, newRole]);
      toast({
        title: "เพิ่มบทบาทใหม่สำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    onClose();
  };

  const handleConfirmDelete = () => {
    if (selectedRole) {
      setRoles((prev) => prev.filter((role) => role.id !== selectedRole.id));
      toast({
        title: "ลบบทบาทสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
    onDeleteClose();
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const getPermissionsByCategory = () => {
    const grouped: { [key: string]: typeof allPermissions } = {};
    allPermissions.forEach((permission) => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  const getRoleColor = (role: Role) => {
    if (role.is_system) return "purple";
    if (role.permissions.length >= 15) return "red";
    if (role.permissions.length >= 10) return "orange";
    if (role.permissions.length >= 5) return "blue";
    return "green";
  };

  return (
    <Box>
      {/* Breadcrumb */}
      <Breadcrumb mb={6} fontSize="sm">
        <BreadcrumbItem>
          <Link href="/settings">
            <BreadcrumbLink>ตั้งค่าระบบ</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/settings/employees">
            <BreadcrumbLink>จัดการพนักงาน</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>บทบาทและสิทธิ์</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <HStack spacing={4}>
          <Link href="/settings/employees">
            <Button variant="ghost" leftIcon={<FiArrowLeft />} size="sm">
              กลับ
            </Button>
          </Link>
          <Box>
            <Heading size="lg" fontFamily="heading">
              บทบาทและสิทธิ์
            </Heading>
            <Text color="gray.600">
              จัดการบทบาทและสิทธิ์การเข้าถึงของพนักงาน
            </Text>
          </Box>
        </HStack>

        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleAddRole}
        >
          เพิ่มบทบาทใหม่
        </Button>
      </HStack>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  บทบาททั้งหมด
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {roles.length}
                </Text>
              </Box>
              <Icon as={FiShield} boxSize={8} color="blue.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  พนักงานทั้งหมด
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {roles.reduce((sum, role) => sum + role.employee_count, 0)}
                </Text>
              </Box>
              <Icon as={FiUsers} boxSize={8} color="green.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  บทบาทระบบ
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {roles.filter((r) => r.is_system).length}
                </Text>
              </Box>
              <Icon as={FiLock} boxSize={8} color="purple.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  สิทธิ์ทั้งหมด
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {allPermissions.length}
                </Text>
              </Box>
              <Icon as={FiUserCheck} boxSize={8} color="orange.500" />
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Search */}
      <Card mb={6}>
        <CardBody>
          <InputGroup maxW="400px">
            <InputLeftElement>
              <FiSearch />
            </InputLeftElement>
            <Input
              placeholder="ค้นหาบทบาทหรือคำอธิบาย..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </CardBody>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              รายการบทบาท ({filteredRoles.length})
            </Text>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>บทบาท</Th>
                <Th>คำอธิบาย</Th>
                <Th>สิทธิ์</Th>
                <Th>พนักงาน</Th>
                <Th>ประเภท</Th>
                <Th>วันที่สร้าง</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRoles.map((role) => (
                <Tr key={role.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{role.name}</Text>
                      <Badge colorScheme={getRoleColor(role)} variant="subtle">
                        {role.permissions.length} สิทธิ์
                      </Badge>
                    </VStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm" noOfLines={2}>
                      {role.description}
                    </Text>
                  </Td>
                  <Td>
                    <Wrap spacing={1}>
                      {role.permissions.slice(0, 3).map((permission) => {
                        const perm = allPermissions.find(
                          (p) => p.value === permission
                        );
                        return (
                          <WrapItem key={permission}>
                            <Tag size="sm" variant="outline">
                              {perm?.label}
                            </Tag>
                          </WrapItem>
                        );
                      })}
                      {role.permissions.length > 3 && (
                        <WrapItem>
                          <Tag size="sm" colorScheme="gray">
                            +{role.permissions.length - 3}
                          </Tag>
                        </WrapItem>
                      )}
                    </Wrap>
                  </Td>
                  <Td>
                    <Text fontWeight="medium">{role.employee_count} คน</Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={role.is_system ? "purple" : "blue"}
                      variant={role.is_system ? "solid" : "outline"}
                    >
                      {role.is_system ? "ระบบ" : "กำหนดเอง"}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {new Date(role.created_at).toLocaleDateString("th-TH")}
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
                          onClick={() => handleEditRole(role)}
                        >
                          ดูรายละเอียด
                        </MenuItem>
                        <MenuItem
                          icon={<FiEdit2 />}
                          onClick={() => handleEditRole(role)}
                        >
                          แก้ไข
                        </MenuItem>
                        {!role.is_system && (
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={() => handleDeleteRole(role)}
                          >
                            ลบ
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Add/Edit Role Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "แก้ไขบทบาท" : "เพิ่มบทบาทใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>ชื่อบทบาท</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="เช่น ผู้จัดการขาย"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>คำอธิบาย</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="อธิบายหน้าที่และความรับผิดชอบของบทบาทนี้"
                  rows={3}
                />
              </FormControl>

              <Divider />

              <Box>
                <Text fontWeight="medium" mb={4}>
                  สิทธิ์การเข้าถึง ({formData.permissions.length} รายการ)
                </Text>

                <VStack spacing={4} align="stretch">
                  {Object.entries(getPermissionsByCategory()).map(
                    ([category, permissions]) => (
                      <Box key={category}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium" color="gray.700">
                            {category}
                          </Text>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              const categoryPermissions = permissions.map(
                                (p) => p.value
                              );
                              const hasAll = categoryPermissions.every((p) =>
                                formData.permissions.includes(p)
                              );

                              if (hasAll) {
                                // Remove all category permissions
                                setFormData((prev) => ({
                                  ...prev,
                                  permissions: prev.permissions.filter(
                                    (p) => !categoryPermissions.includes(p)
                                  ),
                                }));
                              } else {
                                // Add all category permissions
                                setFormData((prev) => ({
                                  ...prev,
                                  permissions: [
                                    ...prev.permissions.filter(
                                      (p) => !categoryPermissions.includes(p)
                                    ),
                                    ...categoryPermissions,
                                  ],
                                }));
                              }
                            }}
                          >
                            {permissions.every((p) =>
                              formData.permissions.includes(p.value)
                            )
                              ? "ยกเลิกทั้งหมด"
                              : "เลือกทั้งหมด"}
                          </Button>
                        </HStack>
                        <Wrap spacing={2}>
                          {permissions.map((permission) => (
                            <WrapItem key={permission.value}>
                              <Tag
                                size="md"
                                variant={
                                  formData.permissions.includes(
                                    permission.value
                                  )
                                    ? "solid"
                                    : "outline"
                                }
                                colorScheme={
                                  formData.permissions.includes(
                                    permission.value
                                  )
                                    ? "blue"
                                    : "gray"
                                }
                                cursor="pointer"
                                onClick={() =>
                                  togglePermission(permission.value)
                                }
                              >
                                <TagLabel>{permission.label}</TagLabel>
                                {formData.permissions.includes(
                                  permission.value
                                ) && (
                                  <TagCloseButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePermission(permission.value);
                                    }}
                                  />
                                )}
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                    )
                  )}
                </VStack>
              </Box>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  สิทธิ์ที่เลือกจะส่งผลต่อพนักงานที่มีบทบาทนี้ทั้งหมด
                  กรุณาตรวจสอบให้ถูกต้องก่อนบันทึก
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={handleSaveRole}>
              {isEditing ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มบทบาท"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ยืนยันการลบบทบาท</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text>
                คุณต้องการลบบทบาท <strong>"{selectedRole?.name}"</strong>{" "}
                หรือไม่?
              </Text>

              {selectedRole && selectedRole.employee_count > 0 && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="medium">คำเตือน</Text>
                    <Text fontSize="sm">
                      มีพนักงาน {selectedRole.employee_count} คนที่มีบทบาทนี้
                      การลบจะส่งผลต่อการเข้าถึงระบบของพนักงานเหล่านี้
                    </Text>
                  </Box>
                </Alert>
              )}

              <Text fontSize="sm" color="gray.600">
                การกระทำนี้ไม่สามารถยกเลิกได้
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="red" onClick={handleConfirmDelete}>
              ลบบทบาท
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

RolesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="บทบาทและสิทธิ์">{page}</Layout>;
};

export default withAuth(RolesPage) as NextPageWithLayout;
