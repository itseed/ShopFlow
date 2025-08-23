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
  Textarea,
  Select,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useClipboard,
  Code,
  Divider,
  Tag,
  TagLabel,
  Switch,
  Progress,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiKey,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiShield,
  FiClock,
  FiActivity,
  FiAlertTriangle,
} from "react-icons/fi";
import Link from "next/link";
import { useApiKeys } from "../../../lib/hooks/useSecurity";
import { ApiKey as ServiceApiKey } from "../../../lib/services/securityService";

interface ApiKey extends ServiceApiKey {
  key: string; // Add the key property that exists in the UI but not in the service
}

const permissions = [
  { value: "read:products", label: "อ่านข้อมูลสินค้า" },
  { value: "write:products", label: "เขียนข้อมูลสินค้า" },
  { value: "read:orders", label: "อ่านคำสั่งซื้อ" },
  { value: "write:orders", label: "เขียนคำสั่งซื้อ" },
  { value: "read:customers", label: "อ่านข้อมูลลูกค้า" },
  { value: "write:customers", label: "เขียนข้อมูลลูกค้า" },
  { value: "read:reports", label: "อ่านรายงาน" },
  { value: "admin", label: "สิทธิ์ผู้ดูแลระบบ" },
];

function ApiKeysPage() {
  const toast = useToast();
  const {
    apiKeys: serviceApiKeys,
    loading,
    error,
    creating,
    updating,
    deleting,
    refresh,
    createApiKey,
    updateApiKey,
    deleteApiKey,
  } = useApiKeys();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    expires_at: "",
    rate_limit: 1000,
  });

  // Convert service API keys to UI API keys
  const apiKeys: ApiKey[] = serviceApiKeys.map((key) => ({
    ...key,
    key: key.key_hash, // Use key_hash as key for display purposes
  }));

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const filteredApiKeys = apiKeys.filter(
    (key) =>
      key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddApiKey = () => {
    setSelectedApiKey(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
      expires_at: "",
      rate_limit: 1000,
    });
    setIsEditing(false);
    onOpen();
  };

  const handleEditApiKey = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setFormData({
      name: apiKey.name,
      description: apiKey.description || "",
      permissions: apiKey.permissions,
      expires_at: apiKey.expires_at ? apiKey.expires_at.split("T")[0] : "",
      rate_limit: apiKey.rate_limit,
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDeleteApiKey = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    onDeleteOpen();
  };

  const confirmDeleteApiKey = async () => {
    if (selectedApiKey) {
      try {
        const result = await deleteApiKey(selectedApiKey.id);

        if (result.success) {
          toast({
            title: "ลบ API Key สำเร็จ",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onDeleteClose();
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description:
            error instanceof Error ? error.message : "ไม่สามารถลบ API Key ได้",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && selectedApiKey) {
        // Update existing API key
        const result = await updateApiKey(selectedApiKey.id, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          expires_at: formData.expires_at || null,
          rate_limit: formData.rate_limit,
        });

        if (result.success) {
          toast({
            title: "อัปเดต API Key สำเร็จ",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onClose();
        } else {
          throw new Error(result.error);
        }
      } else {
        // Create new API key
        const result = await createApiKey({
          name: formData.name,
          description: formData.description,
          key_hash: "", // This would be generated on the server
          permissions: formData.permissions,
          expires_at: formData.expires_at || null,
          is_active: true,
          rate_limit: formData.rate_limit,
        });

        if (result.success) {
          toast({
            title: "สร้าง API Key ใหม่สำเร็จ",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onClose();
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error
            ? error.message
            : "ไม่สามารถบันทึก API Key ได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "คัดลอก API Key แล้ว",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const getUsagePercentage = (apiKey: ApiKey) => {
    return Math.min(100, (apiKey.usage_count / apiKey.rate_limit) * 100);
  };

  const getStatusColor = (apiKey: ApiKey) => {
    if (!apiKey.is_active) return "red";
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date())
      return "orange";
    return "green";
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const toggleShowKey = (keyId: string) => {
    setShowKey((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const toggleApiKeyStatus = async (keyId: string) => {
    const apiKey = apiKeys.find((k) => k.id === keyId);
    if (apiKey) {
      try {
        const result = await updateApiKey(keyId, {
          is_active: !apiKey.is_active,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast({
          title: apiKey.is_active
            ? "ปิดการใช้งาน API Key"
            : "เปิดการใช้งาน API Key",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description:
            error instanceof Error
              ? error.message
              : "ไม่สามารถอัปเดตสถานะ API Key ได้",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedApiKey) {
      try {
        const result = await deleteApiKey(selectedApiKey.id);

        if (result.success) {
          toast({
            title: "ลบ API Key สำเร็จ",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onDeleteClose();
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description:
            error instanceof Error ? error.message : "ไม่สามารถลบ API Key ได้",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
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
          <Link href="/settings/security">
            <BreadcrumbLink>ความปลอดภัย</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>API Keys</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <HStack spacing={4}>
          <Link href="/settings/security">
            <Button variant="ghost" leftIcon={<FiArrowLeft />} size="sm">
              กลับ
            </Button>
          </Link>
          <Box>
            <Heading size="lg" fontFamily="heading">
              จัดการ API Keys
            </Heading>
            <Text color="gray.600">
              สร้างและจัดการ API Keys สำหรับการเชื่อมต่อกับระบบภายนอก
            </Text>
          </Box>
        </HStack>

        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleAddApiKey}
        >
          สร้าง API Key ใหม่
        </Button>
      </HStack>

      {/* Security Warning */}
      <Alert status="warning" borderRadius="lg" mb={6}>
        <AlertIcon />
        <Box>
          <Text fontWeight="medium">คำเตือนความปลอดภัย</Text>
          <Text fontSize="sm">
            API Keys ให้สิทธิ์การเข้าถึงข้อมูลของระบบ
            กรุณาเก็บรักษาไว้ในที่ปลอดภัย
            และอย่าแชร์ให้ผู้อื่นที่ไม่ได้รับอนุญาต
          </Text>
        </Box>
      </Alert>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  API Keys ทั้งหมด
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {apiKeys.length}
                </Text>
              </Box>
              <Icon as={FiKey} boxSize={8} color="blue.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  ใช้งานอยู่
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {apiKeys.filter((k) => k.is_active).length}
                </Text>
              </Box>
              <Icon as={FiShield} boxSize={8} color="green.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  หมดอายุแล้ว
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {apiKeys.filter((k) => isExpired(k.expires_at)).length}
                </Text>
              </Box>
              <Icon as={FiClock} boxSize={8} color="red.500" />
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="gray.600">
                  การใช้งานทั้งหมด
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {apiKeys.reduce((sum, key) => sum + key.usage_count, 0)}
                </Text>
              </Box>
              <Icon as={FiActivity} boxSize={8} color="purple.500" />
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
              placeholder="ค้นหา API Key หรือคำอธิบาย..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </CardBody>
      </Card>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              รายการ API Keys ({filteredApiKeys.length})
            </Text>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ชื่อ & คำอธิบาย</Th>
                <Th>API Key</Th>
                <Th>สิทธิ์</Th>
                <Th>การใช้งาน</Th>
                <Th>สถานะ</Th>
                <Th>วันหมดอายุ</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredApiKeys.map((apiKey) => (
                <Tr key={apiKey.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{apiKey.name}</Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {apiKey.description}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Code
                        fontSize="xs"
                        p={1}
                        borderRadius="md"
                        bg="gray.100"
                        maxW="150px"
                      >
                        {showKey[apiKey.id]
                          ? apiKey.key
                          : apiKey.key.substring(0, 16) + "..."}
                      </Code>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={showKey[apiKey.id] ? <FiEyeOff /> : <FiEye />}
                        onClick={() => toggleShowKey(apiKey.id)}
                        aria-label={
                          showKey[apiKey.id] ? "ซ่อน API Key" : "แสดง API Key"
                        }
                      />
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<FiCopy />}
                        onClick={() => copyApiKey(apiKey.key)}
                        aria-label="คัดลอก API Key"
                      />
                    </HStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      {apiKey.permissions.slice(0, 2).map((permission) => {
                        const perm = permissions.find(
                          (p) => p.value === permission
                        );
                        return (
                          <Tag key={permission} size="sm" variant="outline">
                            <TagLabel>{perm?.label}</TagLabel>
                          </Tag>
                        );
                      })}
                      {apiKey.permissions.length > 2 && (
                        <Text fontSize="xs" color="gray.500">
                          +{apiKey.permissions.length - 2} เพิ่มเติม
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {apiKey.usage_count.toLocaleString()} /{" "}
                        {apiKey.rate_limit.toLocaleString()}
                      </Text>
                      <Progress
                        value={getUsagePercentage(apiKey)}
                        size="sm"
                        width="80px"
                        colorScheme={
                          getUsagePercentage(apiKey) > 80 ? "red" : "blue"
                        }
                      />
                      {apiKey.last_used && (
                        <Text fontSize="xs" color="gray.500">
                          ใช้ล่าสุด:{" "}
                          {new Date(apiKey.last_used).toLocaleDateString(
                            "th-TH"
                          )}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={2}>
                      <Badge
                        colorScheme={getStatusColor(apiKey)}
                        variant="solid"
                      >
                        {!apiKey.is_active
                          ? "ปิดใช้งาน"
                          : isExpired(apiKey.expires_at)
                          ? "หมดอายุ"
                          : "ใช้งานได้"}
                      </Badge>
                      <Switch
                        size="sm"
                        isChecked={apiKey.is_active}
                        onChange={() => toggleApiKeyStatus(apiKey.id)}
                        colorScheme="green"
                      />
                    </VStack>
                  </Td>
                  <Td>
                    {apiKey.expires_at ? (
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          {new Date(apiKey.expires_at).toLocaleDateString(
                            "th-TH"
                          )}
                        </Text>
                        {isExpired(apiKey.expires_at) && (
                          <HStack spacing={1}>
                            <Icon
                              as={FiAlertTriangle}
                              color="red.500"
                              size="sm"
                            />
                            <Text fontSize="xs" color="red.500">
                              หมดอายุแล้ว
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        ไม่หมดอายุ
                      </Text>
                    )}
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
                          icon={<FiEdit2 />}
                          onClick={() => handleEditApiKey(apiKey)}
                        >
                          แก้ไข
                        </MenuItem>
                        <MenuItem
                          icon={<FiCopy />}
                          onClick={() => copyApiKey(apiKey.key)}
                        >
                          คัดลอก Key
                        </MenuItem>
                        <MenuItem
                          icon={<FiTrash2 />}
                          color="red.500"
                          onClick={() => handleDeleteApiKey(apiKey)}
                        >
                          ลบ
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Add/Edit API Key Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "แก้ไข API Key" : "สร้าง API Key ใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>ชื่อ API Key</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="เช่น Mobile App API"
                />
              </FormControl>

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
                  placeholder="อธิบายการใช้งาน API Key นี้"
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>
                  สิทธิ์การเข้าถึง ({formData.permissions.length} รายการ)
                </FormLabel>
                <VStack align="stretch" spacing={2}>
                  {permissions.map((permission) => (
                    <HStack key={permission.value} justify="space-between">
                      <Text fontSize="sm">{permission.label}</Text>
                      <Switch
                        isChecked={formData.permissions.includes(
                          permission.value
                        )}
                        onChange={() => togglePermission(permission.value)}
                        colorScheme="blue"
                      />
                    </HStack>
                  ))}
                </VStack>
              </FormControl>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>วันหมดอายุ</FormLabel>
                  <Input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expires_at: e.target.value,
                      }))
                    }
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    เว้นว่างไว้หากไม่ต้องการให้หมดอายุ
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>จำกัดการใช้งาน (ต่อเดือน)</FormLabel>
                  <Input
                    type="number"
                    value={formData.rate_limit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rate_limit: Number(e.target.value),
                      }))
                    }
                    min={1}
                  />
                </FormControl>
              </SimpleGrid>

              {!isEditing && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    API Key จะถูกสร้างหลังจากบันทึก
                    กรุณาคัดลอกและเก็บไว้ในที่ปลอดภัย
                    เนื่องจากจะไม่สามารถดูได้อีกครั้ง
                  </Text>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ยืนยันการลบ API Key</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text>
                คุณต้องการลบ API Key <strong>"{selectedApiKey?.name}"</strong>{" "}
                หรือไม่?
              </Text>

              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">คำเตือน</Text>
                  <Text fontSize="sm">
                    การลบ API Key จะทำให้แอปพลิเคชันที่ใช้งานหยุดทำงาน
                    กรุณาแน่ใจว่าไม่มีการใช้งานอยู่
                  </Text>
                </Box>
              </Alert>

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
              ลบ API Key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

ApiKeysPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการ API Keys">{page}</Layout>;
};

export default withAuth(ApiKeysPage) as NextPageWithLayout;
