import React, { useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../_app";
import Layout from "../../../components/Layout";
import { withAuth } from "../../../lib/auth";
import { useRouter } from "next/router";
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
  Select,
  useToast,
  Switch,
  FormHelperText,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  Progress,
  Avatar,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Divider,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiSettings,
  FiPlus,
} from "react-icons/fi";
import Link from "next/link";

// Employee interface
interface Employee {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  employee_id: string;
  position: string;
  department: string;
  branch_id: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  salary?: number;
  hire_date: string;
  manager_id?: string;
}

const departments = [
  { value: "sales", label: "ฝ่ายขาย" },
  { value: "marketing", label: "ฝ่ายการตลาด" },
  { value: "it", label: "ฝ่ายเทคโนโลยี" },
  { value: "hr", label: "ฝ่ายทรัพยากรบุคคล" },
  { value: "finance", label: "ฝ่ายการเงิน" },
  { value: "operations", label: "ฝ่ายปฏิบัติการ" },
  { value: "management", label: "ฝ่ายบริหาร" },
];

const branches = [
  { value: "BR-001", label: "สำนักงานใหญ่" },
  { value: "BR-002", label: "สาขาลาดพร้าว" },
  { value: "BR-003", label: "สาขารามอินทรา" },
];

const roles = [
  { value: "admin", label: "ผู้ดูแลระบบ", description: "สิทธิ์เต็มทุกระบบ" },
  {
    value: "manager",
    label: "ผู้จัดการ",
    description: "จัดการข้อมูลและพนักงาน",
  },
  { value: "supervisor", label: "หัวหน้างาน", description: "ดูแลงานในฝ่าย" },
  {
    value: "employee",
    label: "พนักงานทั่วไป",
    description: "ใช้งานระบบพื้นฐาน",
  },
  { value: "viewer", label: "ผู้ดูข้อมูล", description: "ดูข้อมูลเท่านั้น" },
];

const allPermissions = [
  { value: "products.view", label: "ดูข้อมูลสินค้า" },
  { value: "products.create", label: "เพิ่มสินค้าใหม่" },
  { value: "products.edit", label: "แก้ไขสินค้า" },
  { value: "products.delete", label: "ลบสินค้า" },
  { value: "orders.view", label: "ดูคำสั่งซื้อ" },
  { value: "orders.create", label: "สร้างคำสั่งซื้อ" },
  { value: "orders.edit", label: "แก้ไขคำสั่งซื้อ" },
  { value: "customers.view", label: "ดูข้อมูลลูกค้า" },
  { value: "customers.create", label: "เพิ่มลูกค้าใหม่" },
  { value: "customers.edit", label: "แก้ไขข้อมูลลูกค้า" },
  { value: "reports.view", label: "ดูรายงาน" },
  { value: "settings.view", label: "ดูการตั้งค่า" },
  { value: "settings.edit", label: "แก้ไขการตั้งค่า" },
];

function NewEmployeePage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Employee>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    employee_id: "",
    position: "",
    department: "",
    branch_id: "",
    role: "employee",
    permissions: ["products.view", "orders.view", "customers.view"],
    is_active: true,
    hire_date: new Date().toISOString().split("T")[0],
  });

  const handleSave = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.employee_id
    ) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "ชื่อ นามสกุล อีเมล และรหัสพนักงานเป็นข้อมูลที่จำเป็น",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "เพิ่มพนักงานใหม่สำเร็จ",
        description: `พนักงาน "${formData.first_name} ${formData.last_name}" ถูกเพิ่มเข้าสู่ระบบแล้ว`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      router.push("/settings/employees");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มพนักงานได้ กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmployeeId = () => {
    const prefix = formData.department
      ? formData.department.toUpperCase()
      : "EMP";
    const timestamp = Date.now().toString().slice(-4);
    const randomNum = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    return `${prefix}${timestamp}${randomNum}`;
  };

  const handleRoleChange = (role: string) => {
    let defaultPermissions: string[] = [];

    switch (role) {
      case "admin":
        defaultPermissions = allPermissions.map((p) => p.value);
        break;
      case "manager":
        defaultPermissions = [
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
          "settings.view",
        ];
        break;
      case "supervisor":
        defaultPermissions = [
          "products.view",
          "products.edit",
          "orders.view",
          "orders.edit",
          "customers.view",
          "customers.edit",
          "reports.view",
        ];
        break;
      case "employee":
        defaultPermissions = ["products.view", "orders.view", "customers.view"];
        break;
      case "viewer":
        defaultPermissions = [
          "products.view",
          "orders.view",
          "customers.view",
          "reports.view",
        ];
        break;
    }

    setFormData((prev) => ({ ...prev, role, permissions: defaultPermissions }));
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const getCompletionPercentage = () => {
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "employee_id",
      "position",
      "department",
      "branch_id",
    ];
    const filledFields = requiredFields.filter(
      (field) => formData[field as keyof Employee]
    );
    return Math.round((filledFields.length / requiredFields.length) * 100);
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
          <BreadcrumbLink>เพิ่มพนักงานใหม่</BreadcrumbLink>
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
              เพิ่มพนักงานใหม่
            </Heading>
            <Text color="gray.600">
              กรอกข้อมูลพนักงานใหม่เพื่อเพิ่มเข้าสู่ระบบ
            </Text>
          </Box>
        </HStack>

        <VStack align="end" spacing={2}>
          <Text fontSize="sm" color="gray.600">
            ความสมบูรณ์ของข้อมูล
          </Text>
          <HStack spacing={2}>
            <Progress
              value={getCompletionPercentage()}
              size="sm"
              width="100px"
              colorScheme="blue"
              borderRadius="full"
            />
            <Text fontSize="sm" fontWeight="medium">
              {getCompletionPercentage()}%
            </Text>
          </HStack>
        </VStack>
      </HStack>

      {/* Alert */}
      <Alert status="info" borderRadius="lg" mb={6}>
        <AlertIcon />
        <Box>
          <Text fontWeight="medium">ข้อมูลที่จำเป็น</Text>
          <Text fontSize="sm">
            กรุณากรอกชื่อ นามสกุล อีเมล รหัสพนักงาน ตำแหน่ง แผนก
            และสาขาให้ครบถ้วน
          </Text>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Personal Information */}
        <VStack spacing={6} align="stretch">
          <Card>
            <CardHeader>
              <HStack>
                <FiUser />
                <Heading size="md">ข้อมูลส่วนตัว</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <Avatar
                    size="lg"
                    name={`${formData.first_name} ${formData.last_name}`}
                  />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="medium">รูปประจำตัว</Text>
                    <Text fontSize="sm" color="gray.600">
                      รูปจะถูกสร้างอัตโนมัติจากชื่อ
                    </Text>
                  </VStack>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
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
                      placeholder="ชื่อจริง"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>นามสกุล</FormLabel>
                    <Input
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      placeholder="นามสกุล"
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>อีเมล</FormLabel>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="example@company.com"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>เบอร์โทรศัพท์</FormLabel>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="081-234-5678"
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <HStack>
                <FiMapPin />
                <Heading size="md">ข้อมูลการทำงาน</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>รหัสพนักงาน</FormLabel>
                    <HStack>
                      <Input
                        value={formData.employee_id}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            employee_id: e.target.value,
                          }))
                        }
                        placeholder="EMP001"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            employee_id: generateEmployeeId(),
                          }))
                        }
                      >
                        สร้างอัตโนมัติ
                      </Button>
                    </HStack>
                    <FormHelperText>
                      รหัสประจำตัวพนักงานที่ไม่ซ้ำ
                    </FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>ตำแหน่ง</FormLabel>
                    <Input
                      value={formData.position}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          position: e.target.value,
                        }))
                      }
                      placeholder="เช่น Sales Executive"
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>แผนก</FormLabel>
                    <Select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                    >
                      <option value="">เลือกแผนก</option>
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>สาขา</FormLabel>
                    <Select
                      value={formData.branch_id}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          branch_id: e.target.value,
                        }))
                      }
                    >
                      <option value="">เลือกสาขา</option>
                      {branches.map((branch) => (
                        <option key={branch.value} value={branch.value}>
                          {branch.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>วันที่เริ่มงาน</FormLabel>
                  <Input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hire_date: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">สถานะการทำงาน</Text>
                      <Text fontSize="sm" color="gray.600">
                        เปิดหรือปิดการเข้าถึงระบบ
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={formData.is_active}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_active: e.target.checked,
                        }))
                      }
                      colorScheme="green"
                      size="lg"
                    />
                  </HStack>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <HStack>
              <FiShield />
              <Heading size="md">สิทธิ์การเข้าถึง</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>บทบาท</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </Select>
                <FormHelperText>
                  {roles.find((r) => r.value === formData.role)?.description}
                </FormHelperText>
              </FormControl>

              <Divider />

              <Box>
                <Text fontWeight="medium" mb={3}>
                  สิทธิ์เฉพาะ ({formData.permissions.length} รายการ)
                </Text>
                <Wrap spacing={2}>
                  {allPermissions.map((permission) => (
                    <WrapItem key={permission.value}>
                      <Tag
                        size="md"
                        variant={
                          formData.permissions.includes(permission.value)
                            ? "solid"
                            : "outline"
                        }
                        colorScheme={
                          formData.permissions.includes(permission.value)
                            ? "blue"
                            : "gray"
                        }
                        cursor="pointer"
                        onClick={() => togglePermission(permission.value)}
                      >
                        <TagLabel>{permission.label}</TagLabel>
                        {formData.permissions.includes(permission.value) && (
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
                <Text fontSize="sm" color="gray.600" mt={2}>
                  คลิกเพื่อเพิ่มหรือลบสิทธิ์
                </Text>
              </Box>

              <Alert status="warning" size="sm" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  สิทธิ์ที่เลือกจะมีผลทันทีหลังจากบันทึก กรุณาตรวจสอบให้ถูกต้อง
                </Text>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Save Button */}
      <Card mt={6}>
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">พร้อมเพิ่มพนักงานใหม่หรือยัง?</Text>
              <Text fontSize="sm" color="gray.600">
                ตรวจสอบข้อมูลและสิทธิ์การเข้าถึงให้ครบถ้วนก่อนบันทึก
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Link href="/settings/employees">
                <Button variant="ghost">ยกเลิก</Button>
              </Link>
              <Button
                leftIcon={<FiSave />}
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="กำลังบันทึก..."
                onClick={handleSave}
                size="lg"
              >
                เพิ่มพนักงาน
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}

NewEmployeePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="เพิ่มพนักงานใหม่">{page}</Layout>;
};

export default withAuth(NewEmployeePage) as NextPageWithLayout;
