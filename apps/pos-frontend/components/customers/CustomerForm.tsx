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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
import { Customer, CustomerFormData } from "@shopflow/types";

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave: (data: CustomerFormData) => Promise<void>;
  mode: "create" | "edit";
  isInline?: boolean;
  isSubmitting?: boolean;
  formData?: CustomerFormData;
  onFormDataChange?: (data: CustomerFormData) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  customer,
  onSave,
  mode,
  isInline = false,
  isSubmitting: externalSubmitting = false,
  formData: externalFormData,
  onFormDataChange,
}) => {
  const [internalFormData, setInternalFormData] = useState<CustomerFormData>({
    first_name: "",
    last_name: "",
    company_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
    country: "TH",
    customer_type: "individual",
    status: "active",
    credit_limit: 0,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Use external form data if provided, otherwise use internal
  const formData = externalFormData || internalFormData;
  const setFormData = onFormDataChange || setInternalFormData;
  const isSubmitting = externalSubmitting || loading;

  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (customer && mode === "edit") {
      const newData: CustomerFormData = {
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        company_name: customer.company_name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        city: customer.city || "",
        postal_code: customer.postal_code || "",
        country: customer.country || "TH",
        customer_type: customer.customer_type || "individual",
        status: customer.status || "active",
        credit_limit: customer.credit_limit || 0,
        notes: customer.notes || "",
      };
      setFormData(newData);
    } else if (!externalFormData) {
      // Reset form for create mode only if not using external form data
      const newData: CustomerFormData = {
        first_name: "",
        last_name: "",
        company_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        postal_code: "",
        country: "TH",
        customer_type: "individual",
        status: "active",
        credit_limit: 0,
        notes: "",
      };
      setFormData(newData);
    }
    setErrors({});
  }, [customer, mode, isOpen, externalFormData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name?.trim() && !formData.company_name?.trim()) {
      newErrors.first_name = "กรุณาระบุชื่อลูกค้าหรือชื่อบริษัท";
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

    if (!externalSubmitting) {
      setLoading(true);
    }
    
    try {
      await onSave(formData);
      if (!isInline) {
        const customerName = formData.company_name || `${formData.first_name} ${formData.last_name}`.trim() || "ลูกค้า";
        toast({
          title: mode === "create" ? "เพิ่มลูกค้าสำเร็จ" : "แก้ไขข้อมูลสำเร็จ",
          description: `ข้อมูลลูกค้า ${customerName} ได้รับการบันทึกแล้ว`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
      }
    } catch (error) {
      if (!isInline) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถบันทึกข้อมูลได้",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      if (!externalSubmitting) {
        setLoading(false);
      }
    }
  };

  const handleChange = (field: keyof CustomerFormData, value: any) => {
    if (onFormDataChange && formData) {
      // External form data control
      onFormDataChange({ ...formData, [field]: value });
    } else {
      // Internal form data control
      setInternalFormData((prev: CustomerFormData) => {
        return { ...prev, [field]: value };
      });
    }
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: "" }));
    }
  };


  const formContent = (
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
                  <GridItem>
                    <FormControl isRequired isInvalid={!!errors.first_name}>
                      <FormLabel>ชื่อ</FormLabel>
                      <InputGroup>
                        <InputLeftAddon>
                          <Icon as={IoPersonOutline} />
                        </InputLeftAddon>
                        <Input
                          value={formData.first_name || ""}
                          onChange={(e) => handleChange("first_name", e.target.value)}
                          placeholder="ชื่อ"
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.first_name}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl isInvalid={!!errors.last_name}>
                      <FormLabel>นามสกุล</FormLabel>
                      <Input
                        value={formData.last_name || ""}
                        onChange={(e) => handleChange("last_name", e.target.value)}
                        placeholder="นามสกุล"
                      />
                      <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  <GridItem colSpan={2}>
                    <FormControl isInvalid={!!errors.company_name}>
                      <FormLabel>ชื่อบริษัท (ถ้าเป็นลูกค้าบริษัท)</FormLabel>
                      <Input
                        value={formData.company_name || ""}
                        onChange={(e) => handleChange("company_name", e.target.value)}
                        placeholder="ชื่อบริษัท"
                      />
                      <FormErrorMessage>{errors.company_name}</FormErrorMessage>
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

            {/* Additional Information */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Text fontSize="md" fontWeight="medium">
                  ข้อมูลเพิ่มเติม
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>เมือง</FormLabel>
                      <Input
                        value={formData.city || ""}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="เมือง"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>รหัสไปรษณีย์</FormLabel>
                      <Input
                        value={formData.postal_code || ""}
                        onChange={(e) => handleChange("postal_code", e.target.value)}
                        placeholder="รหัสไปรษณีย์"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>ประเทศ</FormLabel>
                      <Input
                        value={formData.country || "TH"}
                        onChange={(e) => handleChange("country", e.target.value)}
                        placeholder="ประเทศ"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>ประเภทลูกค้า</FormLabel>
                      <Select
                        value={formData.customer_type || "individual"}
                        onChange={(e) =>
                          handleChange("customer_type", e.target.value as any)
                        }
                      >
                        <option value="individual">บุคคล</option>
                        <option value="business">บริษัท</option>
                        <option value="regular">ลูกค้าประจำ</option>
                        <option value="vip">VIP</option>
                        <option value="wholesale">ขายส่ง</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>สถานะ</FormLabel>
                      <Select
                        value={formData.status || "active"}
                        onChange={(e) =>
                          handleChange("status", e.target.value as any)
                        }
                      >
                        <option value="active">ใช้งาน</option>
                        <option value="inactive">ไม่ใช้งาน</option>
                        <option value="vip">VIP</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>วงเงินเครดิต</FormLabel>
                      <NumberInput
                        value={formData.credit_limit || 0}
                        onChange={(_valueAsString: string, valueAsNumber: number) =>
                          handleChange("credit_limit", valueAsNumber)
                        }
                        min={0}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Notes */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Text fontSize="md" fontWeight="medium">
                  หมายเหตุเพิ่มเติม
                </Text>
              </CardHeader>
              <CardBody>
                <FormControl>
                  <Textarea
                    value={formData.notes || ""}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="หมายเหตุเกี่ยวกับลูกค้า (ไม่บังคับ)"
                    rows={4}
                  />
                </FormControl>
              </CardBody>
            </Card>


            {/* Submit Buttons - only show in inline mode */}
            {isInline && (
              <HStack spacing={3} justify="flex-end" pt={4}>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  leftIcon={<Icon as={IoCloseOutline} />}
                  isDisabled={isSubmitting}
                >
                  ยกเลิก
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="กำลังบันทึก..."
                  leftIcon={<Icon as={IoSaveOutline} />}
                  size="lg"
                >
                  {mode === "create" ? "เพิ่มลูกค้า" : "บันทึกการแก้ไข"}
                </Button>
              </HStack>
            )}
          </VStack>
  );

  if (isInline) {
    return formContent;
  }

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
          {formContent}
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
              isLoading={isSubmitting}
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
