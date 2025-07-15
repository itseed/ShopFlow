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
  Textarea,
  useToast,
  Switch,
  FormHelperText,
  SimpleGrid,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  Progress,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiSave,
  FiMapPin,
  FiCheck,
  FiClock,
  FiPhone,
  FiMail,
  FiUser,
} from "react-icons/fi";
import Link from "next/link";

// Branch interface
interface Branch {
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
}

const dayNames = {
  monday: "จันทร์",
  tuesday: "อังคาร",
  wednesday: "พุธ",
  thursday: "พฤหัสบดี",
  friday: "ศุกร์",
  saturday: "เสาร์",
  sunday: "อาทิตย์",
};

function NewBranchPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Branch>({
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

  const updateOpeningHours = (
    day: keyof typeof dayNames,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.address) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "ชื่อสาขา รหัสสาขา และที่อยู่เป็นข้อมูลที่จำเป็น",
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
        title: "เพิ่มสาขาใหม่สำเร็จ",
        description: `สาขา "${formData.name}" ถูกเพิ่มเข้าสู่ระบบแล้ว`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      router.push("/settings/branches");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสาขาได้ กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    const requiredFields = [
      "name",
      "code",
      "address",
      "manager_name",
      "manager_phone",
      "phone",
    ];
    const filledFields = requiredFields.filter(
      (field) => formData[field as keyof Branch]
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
          <Link href="/settings/branches">
            <BreadcrumbLink>จัดการสาขา</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>เพิ่มสาขาใหม่</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <HStack spacing={4}>
          <Link href="/settings/branches">
            <Button variant="ghost" leftIcon={<FiArrowLeft />} size="sm">
              กลับ
            </Button>
          </Link>
          <Box>
            <Heading size="lg" fontFamily="heading">
              เพิ่มสาขาใหม่
            </Heading>
            <Text color="gray.600">
              กรอกข้อมูลสาขาใหม่เพื่อเพิ่มเข้าสู่ระบบ
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

      {/* Quick Info Alert */}
      <Alert status="info" borderRadius="lg" mb={6}>
        <AlertIcon />
        <Box>
          <Text fontWeight="medium">ข้อมูลที่จำเป็น</Text>
          <Text fontSize="sm">
            กรุณากรอกชื่อสาขา รหัสสาขา ที่อยู่ ชื่อผู้จัดการ
            และเบอร์โทรศัพท์ให้ครบถ้วน
          </Text>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Main Form */}
        <VStack spacing={6} align="stretch">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <HStack>
                <FiMapPin />
                <Heading size="md">ข้อมูลพื้นฐานสาขา</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>ชื่อสาขา</FormLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="เช่น สาขากรุงเทพ"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>รหัสสาขา</FormLabel>
                    <Input
                      value={formData.code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="เช่น BKK, CNX, HQ"
                    />
                    <FormHelperText>
                      รหัสสำหรับระบุสาขา (ภาษาอังกฤษ 2-5 ตัวอักษร)
                    </FormHelperText>
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>ที่อยู่สาขา</FormLabel>
                  <Textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="ที่อยู่ของสาขา เช่น 123 ถ.สุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110"
                    rows={3}
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>เบอร์โทรศัพท์สาขา</FormLabel>
                    <Input
                      value={formData.phone}
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
                    <FormLabel>อีเมลสาขา</FormLabel>
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
                    <FormHelperText>ไม่บังคับ</FormHelperText>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Manager Information */}
          <Card>
            <CardHeader>
              <HStack>
                <FiUser />
                <Heading size="md">ข้อมูลผู้จัดการสาขา</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>ชื่อผู้จัดการ</FormLabel>
                    <Input
                      value={formData.manager_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          manager_name: e.target.value,
                        }))
                      }
                      placeholder="นาย/นาง/นางสาว ชื่อ นามสกุล"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>เบอร์โทรผู้จัดการ</FormLabel>
                    <Input
                      value={formData.manager_phone}
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
              </VStack>
            </CardBody>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <HStack>
                <FiCheck />
                <Heading size="md">สถานะสาขา</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <FormControl>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">เปิดให้บริการ</Text>
                    <Text fontSize="sm" color="gray.600">
                      เปิดหรือปิดการให้บริการของสาขานี้
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
            </CardBody>
          </Card>
        </VStack>

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <HStack>
              <FiClock />
              <Heading size="md">เวลาทำการ</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {Object.entries(formData.opening_hours).map(([day, hours]) => (
                <Box key={day} p={4} borderRadius="lg" bg="gray.50">
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="medium">
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
                    </HStack>

                    {hours.is_open && (
                      <HStack spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="sm">เวลาเปิด</FormLabel>
                          <Input
                            type="time"
                            size="sm"
                            value={hours.open}
                            onChange={(e) =>
                              updateOpeningHours(
                                day as keyof typeof dayNames,
                                "open",
                                e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <Text fontSize="sm" pt={6} color="gray.600">
                          ถึง
                        </Text>
                        <FormControl>
                          <FormLabel fontSize="sm">เวลาปิด</FormLabel>
                          <Input
                            type="time"
                            size="sm"
                            value={hours.close}
                            onChange={(e) =>
                              updateOpeningHours(
                                day as keyof typeof dayNames,
                                "close",
                                e.target.value
                              )
                            }
                          />
                        </FormControl>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Save Button */}
      <Card mt={6}>
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">พร้อมเพิ่มสาขาใหม่หรือยัง?</Text>
              <Text fontSize="sm" color="gray.600">
                ตรวจสอบข้อมูลให้ครบถ้วนก่อนบันทึก
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Link href="/settings/branches">
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
                เพิ่มสาขา
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}

NewBranchPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="เพิ่มสาขาใหม่">{page}</Layout>;
};

export default withAuth(NewBranchPage) as NextPageWithLayout;
