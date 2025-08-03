import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  Badge,
  Collapse,
  useDisclosure,
  IconButton,
  Divider,
  SimpleGrid,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  IoSearch,
  IoFilter,
  IoChevronDown,
  IoChevronUp,
  IoClose,
  IoCalendar,
  IoCash,
  IoCard,
} from "react-icons/io5";
import { OrderFilters } from "../../lib/orders";

interface AdvancedSearchFilters extends OrderFilters {
  amountRange: [number, number];
  itemCountRange: [number, number];
  cashierIds: string[];
  branchIds: string[];
  hasCustomer: boolean | null;
  dateFrom: string;
  dateTo: string;
}

interface OrderAdvancedSearchProps {
  filters: AdvancedSearchFilters;
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading?: boolean;
  orderCount?: number;
  cashiers?: Array<{ id: string; name: string }>;
  branches?: Array<{ id: string; name: string }>;
}

const OrderAdvancedSearch: React.FC<OrderAdvancedSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  isLoading = false,
  orderCount = 0,
  cashiers = [],
  branches = [],
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [localFilters, setLocalFilters] = useState(filters);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleSearch = () => {
    onSearch();
  };

  const handleReset = () => {
    const resetFilters: AdvancedSearchFilters = {
      searchTerm: "",
      status: "all",
      dateRange: "today",
      paymentMethod: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
      amountRange: [0, 10000],
      itemCountRange: [1, 50],
      cashierIds: [],
      branchIds: [],
      hasCustomer: null,
      dateFrom: "",
      dateTo: "",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.searchTerm) count++;
    if (localFilters.status !== "all") count++;
    if (localFilters.paymentMethod !== "all") count++;
    if (localFilters.dateRange !== "today") count++;
    if (localFilters.cashierIds.length > 0) count++;
    if (localFilters.branchIds.length > 0) count++;
    if (localFilters.hasCustomer !== null) count++;
    if (localFilters.dateFrom || localFilters.dateTo) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card variant="elevated" bg={cardBg}>
      <CardHeader>
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <IoSearch size={20} />
            <Text fontSize="lg" fontWeight="bold">
              ค้นหาคำสั่งซื้อ
            </Text>
            {activeFilterCount > 0 && (
              <Badge colorScheme="blue" variant="solid">
                {activeFilterCount} ตัวกรอง
              </Badge>
            )}
            {orderCount > 0 && (
              <Badge colorScheme="green" variant="outline">
                {orderCount} รายการ
              </Badge>
            )}
          </HStack>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              isDisabled={isLoading}
            >
              รีเซ็ต
            </Button>
            <IconButton
              aria-label="Toggle advanced search"
              icon={isOpen ? <IoChevronUp /> : <IoChevronDown />}
              size="sm"
              variant="ghost"
              onClick={onToggle}
            />
          </HStack>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Basic Search */}
          <HStack spacing={4}>
            <InputGroup flex={2}>
              <InputLeftElement>
                <IoSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="ค้นหาด้วยเลขที่คำสั่ง, ชื่อลูกค้า, เลขใบเสร็จ..."
                value={localFilters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                size="lg"
              />
            </InputGroup>
            <Button
              leftIcon={<IoSearch />}
              colorScheme="blue"
              onClick={handleSearch}
              isLoading={isLoading}
              size="lg"
            >
              ค้นหา
            </Button>
          </HStack>

          {/* Quick Filters */}
          <HStack spacing={4} flexWrap="wrap">
            <Select
              value={localFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              w="200px"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="completed">สำเร็จ</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="cancelled">ยกเลิก</option>
              <option value="refunded">คืนเงิน</option>
            </Select>

            <Select
              value={localFilters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              w="200px"
            >
              <option value="today">วันนี้</option>
              <option value="yesterday">เมื่อวาน</option>
              <option value="week">สัปดาห์นี้</option>
              <option value="month">เดือนนี้</option>
              <option value="last_month">เดือนที่แล้ว</option>
              <option value="year">ปีนี้</option>
              <option value="all">ทั้งหมด</option>
            </Select>

            <Select
              value={localFilters.paymentMethod}
              onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
              w="200px"
            >
              <option value="all">วิธีชำระทั้งหมด</option>
              <option value="cash">เงินสด</option>
              <option value="card">บัตร</option>
              <option value="digital">ดิจิทัล</option>
              <option value="qr">QR</option>
            </Select>
          </HStack>

          {/* Advanced Filters */}
          <Collapse in={isOpen} animateOpacity>
            <VStack spacing={6} align="stretch" pt={4}>
              <Divider />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Date Range */}
                <FormControl>
                  <FormLabel>ช่วงวันที่แบบกำหนดเอง</FormLabel>
                  <HStack spacing={2}>
                    <Input
                      type="date"
                      value={localFilters.dateFrom}
                      onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                      size="sm"
                    />
                    <Text fontSize="sm" color="gray.500">
                      ถึง
                    </Text>
                    <Input
                      type="date"
                      value={localFilters.dateTo}
                      onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                      size="sm"
                    />
                  </HStack>
                </FormControl>

                {/* Amount Range */}
                <FormControl>
                  <FormLabel>ช่วงยอดเงิน (บาท)</FormLabel>
                  <VStack spacing={3}>
                    <RangeSlider
                      value={localFilters.amountRange}
                      onChange={(value) => handleFilterChange("amountRange", value)}
                      min={0}
                      max={10000}
                      step={100}
                    >
                      <RangeSliderTrack>
                        <RangeSliderFilledTrack />
                      </RangeSliderTrack>
                      <RangeSliderThumb index={0} />
                      <RangeSliderThumb index={1} />
                    </RangeSlider>
                    <HStack spacing={2} w="full">
                      <NumberInput
                        value={localFilters.amountRange[0]}
                        onChange={(_, value) =>
                          handleFilterChange("amountRange", [
                            value,
                            localFilters.amountRange[1],
                          ])
                        }
                        min={0}
                        max={localFilters.amountRange[1]}
                        size="sm"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500">
                        -
                      </Text>
                      <NumberInput
                        value={localFilters.amountRange[1]}
                        onChange={(_, value) =>
                          handleFilterChange("amountRange", [
                            localFilters.amountRange[0],
                            value,
                          ])
                        }
                        min={localFilters.amountRange[0]}
                        max={50000}
                        size="sm"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  </VStack>
                </FormControl>

                {/* Item Count Range */}
                <FormControl>
                  <FormLabel>จำนวนรายการสินค้า</FormLabel>
                  <VStack spacing={3}>
                    <RangeSlider
                      value={localFilters.itemCountRange}
                      onChange={(value) => handleFilterChange("itemCountRange", value)}
                      min={1}
                      max={50}
                      step={1}
                    >
                      <RangeSliderTrack>
                        <RangeSliderFilledTrack />
                      </RangeSliderTrack>
                      <RangeSliderThumb index={0} />
                      <RangeSliderThumb index={1} />
                    </RangeSlider>
                    <HStack spacing={2} w="full">
                      <NumberInput
                        value={localFilters.itemCountRange[0]}
                        onChange={(_, value) =>
                          handleFilterChange("itemCountRange", [
                            value,
                            localFilters.itemCountRange[1],
                          ])
                        }
                        min={1}
                        max={localFilters.itemCountRange[1]}
                        size="sm"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500">
                        -
                      </Text>
                      <NumberInput
                        value={localFilters.itemCountRange[1]}
                        onChange={(_, value) =>
                          handleFilterChange("itemCountRange", [
                            localFilters.itemCountRange[0],
                            value,
                          ])
                        }
                        min={localFilters.itemCountRange[0]}
                        max={100}
                        size="sm"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  </VStack>
                </FormControl>

                {/* Customer Filter */}
                <FormControl>
                  <FormLabel>ลูกค้า</FormLabel>
                  <Select
                    value={
                      localFilters.hasCustomer === null
                        ? "all"
                        : localFilters.hasCustomer
                        ? "with_customer"
                        : "without_customer"
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value === "all"
                          ? null
                          : e.target.value === "with_customer";
                      handleFilterChange("hasCustomer", value);
                    }}
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="with_customer">มีข้อมูลลูกค้า</option>
                    <option value="without_customer">ลูกค้าทั่วไป</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Cashier Filter */}
              {cashiers.length > 0 && (
                <FormControl>
                  <FormLabel>พนักงานเก็บเงิน</FormLabel>
                  <CheckboxGroup
                    value={localFilters.cashierIds}
                    onChange={(value) => handleFilterChange("cashierIds", value)}
                  >
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                      {cashiers.map((cashier) => (
                        <Checkbox key={cashier.id} value={cashier.id} size="sm">
                          {cashier.name}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </FormControl>
              )}

              {/* Branch Filter */}
              {branches.length > 0 && (
                <FormControl>
                  <FormLabel>สาขา</FormLabel>
                  <CheckboxGroup
                    value={localFilters.branchIds}
                    onChange={(value) => handleFilterChange("branchIds", value)}
                  >
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                      {branches.map((branch) => (
                        <Checkbox key={branch.id} value={branch.id} size="sm">
                          {branch.name}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </FormControl>
              )}

              {/* Apply/Reset Buttons for Advanced */}
              <HStack justify="flex-end" spacing={3} pt={4}>
                <Button variant="ghost" onClick={handleReset} size="sm">
                  รีเซ็ตทั้งหมด
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSearch}
                  isLoading={isLoading}
                  size="sm"
                >
                  ใช้ตัวกรอง
                </Button>
              </HStack>
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderAdvancedSearch;