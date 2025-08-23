import React, { useState, useEffect } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../_app";
import Layout from "../../../components/Layout";
import { withAuth } from "../../../lib/auth";
import {
  useBranches,
  useBranchMutations,
  useBranchStats,
  BranchFormData,
} from "../../../lib/hooks/useBranches";
import { Branch } from "@shopflow/types";
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import {
  FiMapPin,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiPhone,
  FiMail,
  FiClock,
  FiUser,
  FiSettings,
  FiSave,
  FiX,
} from "react-icons/fi";
import Link from "next/link";

// Remove mock data and interface - using types from @shopflow/types now

const dayNames = {
  monday: "จันทร์",
  tuesday: "อังคาร",
  wednesday: "พุธ",
  thursday: "พฤหัสบดี",
  friday: "ศุกร์",
  saturday: "เสาร์",
  sunday: "อาทิตย์",
};

function BranchSettingsPage() {
  // Use real Supabase data instead of mock data
  const { branches, loading, error, refetch } = useBranches();
  const { data: branchStats, isLoading: statsLoading } = useBranchStats();
  const {
    createBranch,
    updateBranch,
    deleteBranch,
    isCreating,
    isUpdating,
    isDeleting,
  } = useBranchMutations();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BranchFormData>>({});

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

  // Filter branches locally
  const filteredBranches = (branches || []).filter(
    (branch) =>
      !searchTerm ||
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    onDetailOpen();
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      is_active: branch.is_active,
    });
    setIsEditing(true);
    onFormOpen();
  };

  const handleAddBranch = () => {
    setSelectedBranch(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      is_active: true,
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleSaveBranch = () => {
    if (!formData.name) {
      toast({
        title: "กรุณากรอกชื่อสาขา",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isEditing && selectedBranch) {
      updateBranch({
        id: selectedBranch.id,
        data: formData as BranchFormData,
      });
    } else {
      createBranch(formData as BranchFormData);
    }

    onFormClose();
  };

  const handleToggleStatus = (branchId: string) => {
    const branch = (branches || []).find((b) => b.id === branchId);
    if (branch) {
      updateBranch({
        id: branchId,
        data: { is_active: !branch.is_active },
      });
    }
  };

  const handleDeleteBranch = (branchId: string) => {
    if (window.confirm("คุณต้องการปิดใช้งานสาขานี้หรือไม่?")) {
      deleteBranch(branchId);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <HStack justify="space-between" mb={4}>
          <Box>
            <Heading size="lg" mb={2} fontFamily="heading">
              จัดการสาขา
            </Heading>
            <Text color="gray.600">จัดการข้อมูลสาขาต่างๆ ของบริษัท</Text>
          </Box>
          <Link href="/settings/branches/new">
            <Button leftIcon={<FiPlus />} colorScheme="blue" size="lg">
              เพิ่มสาขาใหม่
            </Button>
          </Link>
        </HStack>

        {/* Statistics with Real Data */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    สาขาทั้งหมด
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {(branches || []).length}
                  </Text>
                </Box>
                <Icon as={FiMapPin} boxSize={8} color="blue.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    สาขาที่เปิดให้บริการ
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {(branches || []).filter((b) => b.is_active).length}
                  </Text>
                </Box>
                <Icon as={FiClock} boxSize={8} color="green.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    สาขาที่ปิดชั่วคราว
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="red.500">
                    {(branches || []).filter((b) => !b.is_active).length}
                  </Text>
                </Box>
                <Icon as={FiX} boxSize={8} color="red.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    สถิติกรรม
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {branchStats ? branchStats.totalStaff || 0 : 0}
                  </Text>
                </Box>
                <Icon as={FiUser} boxSize={8} color="purple.500" />
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Search */}
      <Card mb={6}>
        <CardBody>
          <InputGroup maxW="400px">
            <InputLeftElement>
              <FiSearch />
            </InputLeftElement>
            <Input
              placeholder="ค้นหาชื่อสาขา, รหัส, หรือที่อยู่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </CardBody>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              รายการสาขา ({filteredBranches.length})
            </Text>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          {error && (
            <Alert status="error" m={4}>
              <AlertIcon />
              <Text>
                {error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลสาขา"}
              </Text>
            </Alert>
          )}
          {loading ? (
            <Flex justify="center" p={8}>
              <VStack spacing={4}>
                <Spinner size="lg" />
                <Text>กำลังโหลดข้อมูลสาขา...</Text>
              </VStack>
            </Flex>
          ) : filteredBranches.length === 0 ? (
            <Flex justify="center" p={8}>
              <VStack spacing={4}>
                <Icon as={FiMapPin} boxSize={12} color="gray.400" />
                <Text color="gray.600">
                  {searchTerm
                    ? "ไม่พบสาขาที่ตรงกับคำค้นหา"
                    : "ยังไม่มีสาขาในระบบ"}
                </Text>
                <Link href="/settings/branches/new">
                  <Button leftIcon={<FiPlus />} colorScheme="blue">
                    เพิ่มสาขาแรก
                  </Button>
                </Link>
              </VStack>
            </Flex>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ชื่อสาขา</Th>
                  <Th>ที่อยู่</Th>
                  <Th>ติดต่อ</Th>
                  <Th>สถานะ</Th>
                  <Th>วันที่สร้าง</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredBranches.map((branch) => (
                  <Tr key={branch.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{branch.name}</Text>
                        <Badge
                          colorScheme="gray"
                          variant="outline"
                          fontSize="xs"
                        >
                          ID: {branch.id.substring(0, 8)}...
                        </Badge>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm" noOfLines={2}>
                        {branch.address || "-"}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        {branch.phone && (
                          <Text fontSize="xs">
                            <Icon as={FiPhone} mr={1} />
                            {branch.phone}
                          </Text>
                        )}
                        {branch.email && (
                          <Text fontSize="xs">
                            <Icon as={FiMail} mr={1} />
                            {branch.email}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Switch
                        isChecked={branch.is_active}
                        onChange={() => handleToggleStatus(branch.id)}
                        colorScheme="green"
                        size="md"
                        isDisabled={isUpdating}
                      />
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {branch.created_at
                          ? new Date(branch.created_at).toLocaleDateString(
                              "th-TH"
                            )
                          : "-"}
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
                            icon={<FiMapPin />}
                            onClick={() => handleViewBranch(branch)}
                          >
                            ดูรายละเอียด
                          </MenuItem>
                          <MenuItem
                            icon={<FiEdit />}
                            onClick={() => handleEditBranch(branch)}
                            isDisabled={isUpdating}
                          >
                            แก้ไข
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            onClick={() => handleDeleteBranch(branch.id)}
                            isDisabled={isDeleting}
                            color="red.500"
                          >
                            ปิดใช้งาน
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

      {/* Branch Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>รายละเอียดสาขา {selectedBranch?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedBranch && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="medium">ชื่อสาขา</Text>
                    <Text>{selectedBranch.name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">สถานะ</Text>
                    <Badge
                      colorScheme={selectedBranch.is_active ? "green" : "red"}
                    >
                      {selectedBranch.is_active
                        ? "เปิดให้บริการ"
                        : "ปิดชั่วคราว"}
                    </Badge>
                  </Box>
                  {selectedBranch.address && (
                    <Box gridColumn="span 2">
                      <Text fontWeight="medium">ที่อยู่</Text>
                      <Text>{selectedBranch.address}</Text>
                    </Box>
                  )}
                  {selectedBranch.phone && (
                    <Box>
                      <Text fontWeight="medium">เบอร์โทร</Text>
                      <Text>{selectedBranch.phone}</Text>
                    </Box>
                  )}
                  {selectedBranch.email && (
                    <Box>
                      <Text fontWeight="medium">อีเมล</Text>
                      <Text>{selectedBranch.email}</Text>
                    </Box>
                  )}
                </SimpleGrid>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailClose}>
              ปิด
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                onDetailClose();
                handleEditBranch(selectedBranch!);
              }}
            >
              แก้ไข
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add/Edit Branch Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "แก้ไขข้อมูลสาขา" : "เพิ่มสาขาใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>ชื่อสาขา</FormLabel>
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="เช่น สาขากรุงเทพ"
                />
              </FormControl>

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
                  placeholder="ที่อยู่ของสาขา"
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>เบอร์โทรศัพท์</FormLabel>
                  <Input
                    value={formData.phone || ""}
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
                    placeholder="branch@company.com"
                  />
                </FormControl>
              </SimpleGrid>

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
                  <Text>เปิดให้บริการ</Text>
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
              onClick={handleSaveBranch}
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

BranchSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการสาขา">{page}</Layout>;
};

export default withAuth(BranchSettingsPage) as NextPageWithLayout;
