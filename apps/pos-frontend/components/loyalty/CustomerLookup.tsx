import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Badge,
  Icon,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Spinner,
  Card,
  CardBody,
  Divider,
  Progress,
  Flex,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoCall, IoSearch, IoCheckmarkCircle, IoPersonAdd, IoTrophy, IoGift } from "react-icons/io5";
import { loyaltyService, POSCustomerLookup } from "@shopflow/api";

interface CustomerLookupProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerSelected: (customerData: POSCustomerLookup) => void;
}

const CustomerLookup: React.FC<CustomerLookupProps> = ({
  isOpen,
  onClose,
  onCustomerSelected,
}) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<POSCustomerLookup | null>(null);
  const [error, setError] = useState("");
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const successBg = useColorModeValue("green.50", "green.900");
  const infoBg = useColorModeValue("blue.50", "blue.900");

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setPhone("");
      setCustomerData(null);
      setError("");
    }
  }, [isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Only numbers
    if (value.length <= 10) {
      setPhone(value);
      setError("");
    }
  };

  const handleSearch = async () => {
    if (phone.length < 9) {
      setError("กรุณาระบุเบอร์โทรศัพท์ให้ครบ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loyaltyService.getPOSCustomerLookup(phone);

      if (result.success && result.data) {
        setCustomerData(result.data);
        
        if (!result.data.customer) {
          toast({
            title: "ไม่พบข้อมูลลูกค้า",
            description: "คุณสามารถสร้างลูกค้าใหม่ได้",
            status: "info",
            duration: 3000,
          });
        } else {
          toast({
            title: "พบข้อมูลลูกค้า",
            description: result.data.customer ? `${result.data.customer.first_name || ""} ${result.data.customer.last_name || ""}`.trim() || result.data.customer.company_name || "ลูกค้า" : "ลูกค้า",
            status: "success",
            duration: 2000,
          });
        }
      } else {
        setError(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setError("ไม่สามารถค้นหาข้อมูลได้");
      console.error("Customer lookup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    setLoading(true);
    try {
      const result = await loyaltyService.findCustomerByPhone({
        phone: phone,
        create_if_not_exists: true,
        first_name: "ลูกค้า",
      });

      if (result.success) {
        // Refresh customer data
        await handleSearch();
        toast({
          title: "สร้างลูกค้าสำเร็จ",
          description: "ลูกค้าใหม่พร้อมเก็บแต้มแล้ว",
          status: "success",
          duration: 3000,
        });
      } else {
        setError(result.error || "ไม่สามารถสร้างลูกค้าได้");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด");
      console.error("Create customer error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSelection = () => {
    if (customerData) {
      onCustomerSelected(customerData);
      onClose();
    }
  };

  const formatPhone = (phoneNum: string) => {
    if (phoneNum.length === 10) {
      return `${phoneNum.substring(0, 3)}-${phoneNum.substring(3, 6)}-${phoneNum.substring(6)}`;
    }
    return phoneNum;
  };

  const getTierColor = (tierColor?: string) => {
    if (!tierColor) return "gray.500";
    return tierColor;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent bg={bgColor} borderRadius="2xl" boxShadow="2xl">
        <ModalHeader
          bgGradient="linear(to-r, blue.500, purple.600)"
          color="white"
          borderTopRadius="2xl"
          py={6}
        >
          <HStack spacing={3}>
            <Icon as={IoSearch} boxSize={6} />
            <Text fontSize="2xl" fontWeight="bold">
              ค้นหาลูกค้าด้วยเบอร์โทร
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Phone Input */}
            <Box>
              <Text mb={2} fontWeight="medium" fontSize="sm" color="gray.600">
                เบอร์โทรศัพท์
              </Text>
              <HStack>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={IoCall} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="0812345678"
                    value={phone}
                    onChange={handlePhoneChange}
                    fontSize="xl"
                    fontWeight="medium"
                    autoFocus
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </InputGroup>
                <Button
                  colorScheme="blue"
                  size="lg"
                  px={8}
                  onClick={handleSearch}
                  isLoading={loading}
                  isDisabled={phone.length < 9}
                >
                  ค้นหา
                </Button>
              </HStack>
              {error && (
                <Text color="red.500" fontSize="sm" mt={2}>
                  {error}
                </Text>
              )}
            </Box>

            {/* Loading State */}
            {loading && (
              <Box textAlign="center" py={8}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text mt={4} color="gray.600">
                  กำลังค้นหา...
                </Text>
              </Box>
            )}

            {/* Customer Not Found */}
            {!loading && customerData && !customerData.customer && (
              <Card bg={infoBg} borderColor={borderColor} borderWidth={2}>
                <CardBody>
                  <VStack spacing={4}>
                    <Icon as={IoPersonAdd} boxSize={12} color="blue.500" />
                    <Text fontSize="lg" fontWeight="bold">
                      ไม่พบข้อมูลลูกค้า
                    </Text>
                    <Text color="gray.600" textAlign="center">
                      เบอร์ {formatPhone(phone)} ยังไม่มีในระบบ
                    </Text>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      leftIcon={<IoPersonAdd />}
                      onClick={handleCreateCustomer}
                      isLoading={loading}
                      w="full"
                    >
                      สร้างลูกค้าใหม่
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Customer Found */}
            {!loading && customerData && customerData.customer && (
              <Card bg={successBg} borderColor="green.300" borderWidth={2}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Avatar
                          name={
                            customerData.customer
                              ? customerData.customer.company_name ||
                                `${customerData.customer.first_name || ""} ${
                                  customerData.customer.last_name || ""
                                }`.trim() ||
                                "ลูกค้า"
                              : "ลูกค้า"
                          }
                          size="lg"
                          bg="green.500"
                          color="white"
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xl" fontWeight="bold">
                            {customerData.customer
                              ? customerData.customer.company_name ||
                                `${customerData.customer.first_name || ""} ${
                                  customerData.customer.last_name || ""
                                }`.trim() ||
                                "ลูกค้า"
                              : "ลูกค้า"}
                          </Text>
                          <Text fontSize="md" color="gray.600">
                            {formatPhone(customerData.customer.phone)}
                          </Text>
                          {customerData.customer.email && (
                            <Text fontSize="sm" color="gray.500">
                              {customerData.customer.email}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <Icon as={IoCheckmarkCircle} boxSize={8} color="green.500" />
                    </HStack>

                    {customerData.membership && (
                      <>
                        <Divider />
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <HStack>
                              <Icon as={IoTrophy} color="yellow.500" />
                              <Text fontWeight="bold">ระดับสมาชิก</Text>
                            </HStack>
                            <Badge
                              colorScheme={customerData.membership.tier_name ? "purple" : "gray"}
                              fontSize="md"
                              px={3}
                              py={1}
                              borderRadius="full"
                              style={{
                                backgroundColor: customerData.membership.tier_color || undefined,
                                color: "white",
                              }}
                            >
                              {customerData.membership.tier_name || "สมาชิกทั่วไป"}
                            </Badge>
                          </HStack>

                          <Box bg="white" p={4} borderRadius="lg" mt={3}>
                            <HStack justify="space-between" mb={2}>
                              <Text color="gray.600">แต้มสะสมปัจจุบัน</Text>
                              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                                {customerData.membership.current_points.toLocaleString()}
                              </Text>
                            </HStack>
                            <Progress
                              value={Math.min(
                                (customerData.membership.current_points / 1000) * 100,
                                100
                              )}
                              colorScheme="purple"
                              size="sm"
                              borderRadius="full"
                            />
                            <HStack justify="space-between" mt={2}>
                              <Text fontSize="sm" color="gray.500">
                                มูลค่า
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="green.600">
                                ฿{customerData.membership.points_value_baht.toLocaleString()}
                              </Text>
                            </HStack>
                          </Box>

                          <Text fontSize="xs" color="gray.500" mt={2}>
                            รหัสสมาชิก: {customerData.membership.membership_number}
                          </Text>
                        </Box>
                      </>
                    )}

                    {customerData.suggested_actions && customerData.suggested_actions.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <HStack mb={2}>
                            <Icon as={IoGift} color="pink.500" />
                            <Text fontWeight="bold" fontSize="sm">
                              สิทธิประโยชน์
                            </Text>
                          </HStack>
                          <HStack spacing={2} flexWrap="wrap">
                            {customerData.suggested_actions.map((action: string, index: number) => (
                              <Badge key={index} colorScheme="pink" fontSize="xs">
                                {action}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>
                      </>
                    )}

                    <Button
                      colorScheme="green"
                      size="lg"
                      onClick={handleConfirmSelection}
                      leftIcon={<IoCheckmarkCircle />}
                      w="full"
                    >
                      เลือกลูกค้านี้
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CustomerLookup;

