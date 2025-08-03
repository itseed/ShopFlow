import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  useColorModeValue,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  IoArrowBackOutline,
  IoPersonAddOutline,
  IoSaveOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import {
  Customer,
  CustomerFormData,
  MembershipType,
} from "@shopflow/types";
import CustomerForm from "../../components/customers/CustomerForm";
import { POSLayout } from "../../components";
import { useCustomers } from "../../hooks/useCustomers";

// Mock membership types - in real app would come from API
const mockMembershipTypes: MembershipType[] = [
  {
    id: "1",
    name: "Gold",
    color: "yellow",
    benefits: ["ส่วนลด 10%", "แต้มสะสม x2", "จัดส่งฟรี", "ใช้แต้มแลกของรางวัล"],
    minSpent: 50000,
    discountPercentage: 10,
    pointsMultiplier: 2,
    description: "สมาชิกระดับทอง สำหรับลูกค้า VIP",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Silver",
    color: "gray",
    benefits: ["ส่วนลด 5%", "แต้มสะสม x1.5", "ข่าวสารพิเศษ"],
    minSpent: 25000,
    discountPercentage: 5,
    pointsMultiplier: 1.5,
    description: "สมาชิกระดับเงิน สำหรับลูกค้าประจำ",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Bronze",
    color: "orange",
    benefits: ["ส่วนลด 2%", "แต้มสะสม x1"],
    minSpent: 10000,
    discountPercentage: 2,
    pointsMultiplier: 1,
    description: "สมาชิกระดับทองแดง สำหรับลูกค้าใหม่",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const NewCustomerPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    dateOfBirth: undefined,
    gender: undefined,
    notes: "",
    membershipType: "",
  });
  const toast = useToast();
  const { createCustomer, loading } = useCustomers({ autoLoad: false });

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  const handleSave = async (customerData: CustomerFormData) => {
    try {
      const newCustomer = await createCustomer(customerData);

      toast({
        title: "เพิ่มลูกค้าสำเร็จ",
        description: `เพิ่มลูกค้า ${customerData.name} แล้ว (รหัส: ${newCustomer.customerNumber})`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to customer detail page
      router.push(`/customers/${newCustomer.id}`);
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มลูกค้าได้ กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    if (
      formData.name ||
      formData.phone ||
      formData.email ||
      formData.address ||
      formData.notes
    ) {
      if (window.confirm("คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการยกเลิกหรือไม่?")) {
        router.push("/customers");
      }
    } else {
      router.push("/customers");
    }
  };

  const handleReset = () => {
    if (window.confirm("ต้องการล้างข้อมูลทั้งหมดหรือไม่?")) {
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        dateOfBirth: undefined,
        gender: undefined,
        notes: "",
        membershipType: "",
      });
    }
  };

  return (
    <POSLayout title="เพิ่มลูกค้าใหม่">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box
          bgGradient={bgGradient}
          borderRadius="2xl"
          p={8}
          color="white"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            position="relative"
            zIndex={1}
          >
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                >
                  <Icon as={IoPersonAddOutline} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    จัดการลูกค้า
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    เพิ่มลูกค้าใหม่
                  </Text>
                </VStack>
              </HStack>

              {/* Breadcrumb */}
              <Breadcrumb color="whiteAlpha.800" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => router.push("/")}>
                    หน้าแรก
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => router.push("/customers")}>
                    จัดการลูกค้า
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink>เพิ่มลูกค้าใหม่</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </VStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<IoRefreshOutline />}
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={handleReset}
                isDisabled={loading}
              >
                ล้างข้อมูล
              </Button>
              <Button
                leftIcon={<IoArrowBackOutline />}
                variant="outline"
                colorScheme="whiteAlpha"
                onClick={handleCancel}
                isDisabled={loading}
              >
                ยกเลิก
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Instructions */}
        <Alert status="info" borderRadius="xl">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="md">คำแนะนำการเพิ่มลูกค้า</AlertTitle>
            <AlertDescription fontSize="sm">
              กรอกข้อมูลลูกค้าใหม่ให้ครบถ้วน ช่องที่มีเครื่องหมาย * เป็นข้อมูลที่จำเป็น
              ระบบจะสร้างรหัสลูกค้าให้อัตโนมัติหลังจากบันทึกข้อมูล
            </AlertDescription>
          </Box>
        </Alert>

        {/* Customer Form */}
        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={IoPersonAddOutline} color="blue.500" boxSize={5} />
              <Text fontSize="lg" fontWeight="bold">
                ข้อมูลลูกค้าใหม่
              </Text>
            </HStack>
          </CardHeader>

          <CardBody>
            <CustomerForm
              isOpen={true}
              onClose={() => {}} // Not used in this context
              customer={null}
              membershipTypes={mockMembershipTypes}
              onSave={handleSave}
              mode="create"
              isInline={true} // Use inline mode instead of modal
              isSubmitting={loading}
              formData={formData}
              onFormDataChange={setFormData}
            />
          </CardBody>
        </Card>

        {/* Membership Info */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">
              ข้อมูลประเภทสมาชิก
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                ลูกค้าสามารถเลือกเป็นสมาชิกเพื่อรับสิทธิประโยชน์พิเศษ:
              </Text>
              
              {mockMembershipTypes.map((type) => (
                <Box
                  key={type.id}
                  p={4}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2}>
                        <Text fontWeight="bold" fontSize="lg">
                          {type.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          (ยอดซื้อขั้นต่ำ {type.minSpent.toLocaleString()} บาท)
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {type.description}
                      </Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {type.benefits.map((benefit, index) => (
                          <Text
                            key={index}
                            fontSize="xs"
                            bg="blue.50"
                            color="blue.700"
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {benefit}
                          </Text>
                        ))}
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </POSLayout>
  );
};

export default NewCustomerPage;