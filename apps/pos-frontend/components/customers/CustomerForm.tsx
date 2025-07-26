import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useToast,
  Switch,
  InputGroup,
  InputLeftAddon,
  Radio,
  RadioGroup,
  Stack,
  Grid,
  GridItem,
  Divider,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Icon,
  Badge,
} from "@chakra-ui/react";
import {
  IoPersonOutline,
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoCardOutline,
  IoSaveOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { Customer, CustomerFormData, MembershipType } from "@shopflow/types";

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  membershipTypes: MembershipType[];
  onSave: (data: CustomerFormData) => Promise<void>;
  mode: "create" | "edit";
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  customer,
  membershipTypes,
  onSave,
  mode,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    dateOfBirth: undefined,
    gender: undefined,
    membershipType: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (customer && mode === "edit") {
      setFormData({
        name: customer.name,
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender,
        membershipType: customer.membership?.membershipType.id || "",
        notes: customer.notes || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        dateOfBirth: undefined,
        gender: undefined,
        membershipType: "",
        notes: "",
      });
    }
    setErrors({});
  }, [customer, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "กรุณาระบุชื่อลูกค้า";
    }

    if (formData.phone && !/^[0-9-+\s()]+$/.test(formData.phone)) {
      newErrors.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      toast({
        title: mode === "create" ? "เพิ่มลูกค้าสำเร็จ" : "แก้ไขข้อมูลสำเร็จ",
        description: `ข้อมูลลูกค้า ${formData.name} ได้รับการบันทึกแล้ว`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CustomerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const selectedMembershipType = membershipTypes.find(
    (type) => type.id === formData.membershipType
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <Icon as={IoPersonOutline} />
            <Text>
              {mode === "create" ? "เพิ่มลูกค้าใหม่" : "แก้ไขข้อมูลลูกค้า"}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Text fontSize="md" fontWeight="medium">
                  ข้อมูลพื้นฐาน
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem colSpan={2}>
                    <FormControl isRequired isInvalid={!!errors.name}>
                      <FormLabel>ชื่อลูกค้า</FormLabel>
                      <InputGroup>
                        <InputLeftAddon>
                          <Icon as={IoPersonOutline} />
                        </InputLeftAddon>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="ระบุชื่อ-นามสกุล"
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={!!errors.phone}>
                      <FormLabel>เบอร์โทรศัพท์</FormLabel>
                      <InputGroup>
                        <InputLeftAddon>
                          <Icon as={IoCallOutline} />
                        </InputLeftAddon>
                        <Input
                          value={formData.phone}
                          onChange={(e) =>
                            handleChange("phone", e.target.value)
                          }
                          placeholder="081-234-5678"
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.phone}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>อีเมล</FormLabel>
                      <InputGroup>
                        <InputLeftAddon>
                          <Icon as={IoMailOutline} />
                        </InputLeftAddon>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleChange("email", e.target.value)
                          }
                          placeholder="example@email.com"
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem colSpan={2}>
                    <FormControl>
                      <FormLabel>ที่อยู่</FormLabel>
                      <Textarea
                        value={formData.address}
                        onChange={(e) =>
                          handleChange("address", e.target.value)
                        }
                        placeholder="ระบุที่อยู่ (ไม่บังคับ)"
                        rows={3}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Personal Information */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Text fontSize="md" fontWeight="medium">
                  ข้อมูลส่วนตัว
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>วันเกิด</FormLabel>
                      <InputGroup>
                        <InputLeftAddon>
                          <Icon as={IoCalendarOutline} />
                        </InputLeftAddon>
                        <Input
                          type="date"
                          value={formatDateForInput(formData.dateOfBirth)}
                          onChange={(e) =>
                            handleChange(
                              "dateOfBirth",
                              e.target.value
                                ? new Date(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>เพศ</FormLabel>
                      <RadioGroup
                        value={formData.gender || ""}
                        onChange={(value) =>
                          handleChange("gender", value || undefined)
                        }
                      >
                        <Stack direction="row" spacing={4}>
                          <Radio value="male">ชาย</Radio>
                          <Radio value="female">หญิง</Radio>
                          <Radio value="other">อื่นๆ</Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Membership Information */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Text fontSize="md" fontWeight="medium">
                  ข้อมูลสมาชิก
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>ประเภทสมาชิก</FormLabel>
                    <Select
                      value={formData.membershipType}
                      onChange={(e) =>
                        handleChange("membershipType", e.target.value)
                      }
                      placeholder="เลือกประเภทสมาชิก (ไม่บังคับ)"
                    >
                      {membershipTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} - ส่วนลด {type.discountPercentage}%
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedMembershipType && (
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <VStack spacing={2} align="start">
                        <HStack>
                          <Badge colorScheme="blue" size="sm">
                            {selectedMembershipType.name}
                          </Badge>
                          <Text fontSize="sm" color="gray.600">
                            ส่วนลด {selectedMembershipType.discountPercentage}%
                          </Text>
                        </HStack>
                        <Text fontSize="sm">
                          {selectedMembershipType.description}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          ยอดซื้อขั้นต่ำ:{" "}
                          {selectedMembershipType.minSpent.toLocaleString()} บาท
                        </Text>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Additional Notes */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Text fontSize="md" fontWeight="medium">
                  หมายเหตุเพิ่มเติม
                </Text>
              </CardHeader>
              <CardBody>
                <FormControl>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="หมายเหตุเกี่ยวกับลูกค้า (ไม่บังคับ)"
                    rows={4}
                  />
                </FormControl>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              onClick={onClose}
              leftIcon={<Icon as={IoCloseOutline} />}
            >
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="กำลังบันทึก..."
              leftIcon={<Icon as={IoSaveOutline} />}
            >
              {mode === "create" ? "เพิ่มลูกค้า" : "บันทึกการแก้ไข"}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomerForm;
